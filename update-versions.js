const fs = require('fs');
const path = require('path');
const { generateHashedFiles } = require('./generate-hashed-files');

// Функция для обновления версий в HTML файлах
function updateHtmlFiles(manifest) {
  const htmlFiles = [
    'public/index.html',
    'public/dashboard.html',
    'public/employer-dashboard.html',
    'public/agency-dashboard.html',
    'public/admin-dashboard.html',
    'public/test-demo.html',
    'public/test-demo-fix.html',
    'public/test-auth.html',
    'public/simple-test.html'
  ];

  htmlFiles.forEach(htmlFile => {
    if (fs.existsSync(htmlFile)) {
      let content = fs.readFileSync(htmlFile, 'utf8');
      
      // Заменяем старые пути на новые хешированные
      Object.entries(manifest).forEach(([original, hashed]) => {
        const oldPath = original.replace(/\\/g, '/');
        const newPath = hashed.replace(/\\/g, '/');
        
        // Извлекаем имя файла без расширения
        const fileName = path.basename(original, '.js');
        
        // Заменяем в script тегах - ищем любую версию файла
        const oldScriptPattern = new RegExp(`src="js-hashed/${fileName}\\.[a-f0-9]+\\.js"`, 'g');
        const newScript = `src="${newPath}"`;
        content = content.replace(oldScriptPattern, newScript);
        
        // Заменяем старые пути без хеша
        const oldScriptWithoutHash = `src="js/${fileName}.js"`;
        content = content.replace(new RegExp(oldScriptWithoutHash, 'g'), newScript);
        
        // Заменяем с версиями
        const oldScriptWithVersion = `src="js/${fileName}.js?v=`;
        content = content.replace(new RegExp(oldScriptWithVersion + '[^"]*"', 'g'), newScript);
      });
      
      fs.writeFileSync(htmlFile, content);
      console.log(`✅ Обновлен: ${htmlFile}`);
    }
  });
}

// Основная функция
function updateVersions() {
  console.log('🚀 Обновление версий файлов...');
  
  // Генерируем хешированные файлы
  const manifest = generateHashedFiles();
  
  // Обновляем HTML файлы
  updateHtmlFiles(manifest);
  
  console.log('✅ Все версии обновлены!');
}

// Запуск
if (require.main === module) {
  updateVersions();
}

module.exports = { updateVersions }; 