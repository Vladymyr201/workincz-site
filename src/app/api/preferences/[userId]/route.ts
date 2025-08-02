import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { UserPreferences } from '@/lib/userPreferences';

// Обработчик GET запроса для получения предпочтений пользователя
export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем, что пользователь запрашивает свои предпочтения
    // или имеет роль администратора
    if (session.user.id !== params.userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Получаем предпочтения из МПС memory
    const userEntityName = `User_${params.userId}`;
    
    // Используем МПС memory для получения предпочтений
    const response = await fetch('http://localhost:3001/api/memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_nodes',
        query: userEntityName
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch preferences from memory service');
    }
    
    const data = await response.json();
    
    // Проверяем, есть ли сущность пользователя в памяти
    if (!data.nodes || data.nodes.length === 0) {
      // Если предпочтений нет, возвращаем пустой объект
      return NextResponse.json({});
    }
    
    // Находим наблюдение с предпочтениями
    const userEntity = data.nodes.find((node: any) => node.name === userEntityName);
    
    if (!userEntity) {
      return NextResponse.json({});
    }
    
    // Ищем наблюдение с предпочтениями
    const preferencesObservation = userEntity.observations.find(
      (obs: string) => obs.startsWith('preferences:')
    );
    
    if (!preferencesObservation) {
      return NextResponse.json({});
    }
    
    // Извлекаем JSON из наблюдения
    const preferencesJson = preferencesObservation.substring('preferences:'.length);
    const preferences = JSON.parse(preferencesJson);
    
    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// Обработчик PUT запроса для обновления предпочтений пользователя
export async function PUT(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    // Проверяем авторизацию
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Проверяем, что пользователь обновляет свои предпочтения
    // или имеет роль администратора
    if (session.user.id !== params.userId && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }
    
    // Получаем данные из запроса
    const preferences: UserPreferences = await request.json();
    
    // Валидируем данные
    if (!preferences || typeof preferences !== 'object') {
      return NextResponse.json(
        { error: 'Invalid preferences data' },
        { status: 400 }
      );
    }
    
    const userEntityName = `User_${params.userId}`;
    
    // Проверяем, существует ли сущность пользователя в памяти
    const searchResponse = await fetch('http://localhost:3001/api/memory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'search_nodes',
        query: userEntityName
      }),
    });
    
    if (!searchResponse.ok) {
      throw new Error('Failed to search memory service');
    }
    
    const searchData = await searchResponse.json();
    const userExists = searchData.nodes && searchData.nodes.some(
      (node: any) => node.name === userEntityName
    );
    
    if (userExists) {
      // Обновляем наблюдение с предпочтениями
      const updateResponse = await fetch('http://localhost:3001/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'delete_observations',
          deletions: [{
            entityName: userEntityName,
            observations: [`preferences:*`]
          }]
        }),
      });
      
      if (!updateResponse.ok) {
        throw new Error('Failed to update preferences in memory service');
      }
      
      // Добавляем новое наблюдение с предпочтениями
      const addResponse = await fetch('http://localhost:3001/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'add_observations',
          observations: [{
            entityName: userEntityName,
            contents: [`preferences:${JSON.stringify(preferences)}`]
          }]
        }),
      });
      
      if (!addResponse.ok) {
        throw new Error('Failed to add preferences to memory service');
      }
    } else {
      // Создаем новую сущность пользователя
      const createResponse = await fetch('http://localhost:3001/api/memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'create_entities',
          entities: [{
            name: userEntityName,
            entityType: 'user',
            observations: [
              `userId:${params.userId}`,
              `preferences:${JSON.stringify(preferences)}`
            ]
          }]
        }),
      });
      
      if (!createResponse.ok) {
        throw new Error('Failed to create user entity in memory service');
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}