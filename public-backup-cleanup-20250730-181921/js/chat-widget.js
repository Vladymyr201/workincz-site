// 💬 Современный real-time чат JobBridge
// Поддержка emoji, быстрых ответов, push-уведомлений, GDPR, мобильная адаптация

class ChatWidget {
  constructor() {
    this.db = firebase.firestore();
    this.auth = firebase.auth();
    this.currentUser = null;
    this.currentChatId = null;
    this.unsubscribeMessages = null;
    this.emojiList = ['😀','👍','🔥','💼','🙏','🎉','😎','❤️','🤝','🇨🇿','🇷🇺','🇺🇦'];
    this.quickReplies = [
      'Здравствуйте! Меня интересует вакансия.',
      'Готов обсудить детали.',
      'Спасибо за ответ!',
      'Когда можно пройти собеседование?',
      'Есть ли жильё?'
    ];
    this.init();
  }

  init() {
    this.createChatModal();
    this.setupEventListeners();
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
    });
  }

  createChatModal() {
    if (document.getElementById('chatModal')) return;
    const modal = document.createElement('div');
    modal.id = 'chatModal';
    modal.className = 'fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 hidden';
    modal.innerHTML = `
      <div class="bg-white rounded-t-2xl md:rounded-2xl shadow-lg w-full max-w-md mx-auto flex flex-col h-[80vh] md:h-[70vh]">
        <div class="flex items-center justify-between p-4 border-b">
          <div class="flex items-center gap-2">
            <span id="chatUserAvatar" class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg"></span>
            <span id="chatUserName" class="font-medium text-gray-900">Чат</span>
            <span id="chatUserOnline" class="ml-2 w-2 h-2 rounded-full bg-success hidden"></span>
          </div>
          <button id="closeChatModal" class="text-gray-400 hover:text-gray-600"><i class="ri-close-line text-2xl"></i></button>
        </div>
        <div id="chatMessages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50"></div>
        <div class="p-3 border-t bg-white">
          <div class="flex gap-2 mb-2 flex-wrap">
            ${this.quickReplies.map(q => `<button class="quick-reply bg-primary/10 text-primary px-3 py-1 rounded-full text-xs hover:bg-primary/20">${q}</button>`).join('')}
          </div>
          <div class="flex items-center gap-2">
            <button id="emojiBtn" class="text-xl"><i class="ri-emotion-happy-line"></i></button>
            <input id="chatInput" type="text" class="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none text-sm" placeholder="Сообщение...">
            <button id="sendMsgBtn" class="bg-primary text-white px-4 py-2 rounded-button font-medium hover:bg-primary/90"><i class="ri-send-plane-2-line"></i></button>
          </div>
          <div id="emojiPicker" class="mt-2 p-2 bg-white border rounded shadow-lg flex gap-1 flex-wrap hidden">
            ${this.emojiList.map(e => `<button class="emoji-btn text-xl">${e}</button>`).join('')}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  setupEventListeners() {
    document.getElementById('closeChatModal').onclick = () => this.hide();
    document.getElementById('emojiBtn').onclick = () => {
      document.getElementById('emojiPicker').classList.toggle('hidden');
    };
    document.querySelectorAll('.emoji-btn').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('chatInput').value += btn.textContent;
        document.getElementById('emojiPicker').classList.add('hidden');
      };
    });
    document.getElementById('sendMsgBtn').onclick = () => this.sendMessage();
    document.getElementById('chatInput').onkeydown = (e) => {
      if (e.key === 'Enter') this.sendMessage();
    };
    document.querySelectorAll('.quick-reply').forEach(btn => {
      btn.onclick = () => {
        document.getElementById('chatInput').value = btn.textContent;
        this.sendMessage();
      };
    });
  }

  // Открыть чат с пользователем/по вакансии
  open({chatId, toUser, vacancyTitle, vacancyId}) {
    document.getElementById('chatModal').classList.remove('hidden');
    document.getElementById('chatUserName').textContent = toUser?.name || 'Пользователь';
    document.getElementById('chatUserAvatar').textContent = (toUser?.name || 'U')[0];
    // TODO: online-статус, аватар, GDPR-privacy
    this.currentChatId = chatId;
    this.listenMessages(chatId);
    // Push уведомление о начале чата
    if (window.notificationManager) {
      window.notificationManager.show('Открыт чат с ' + (toUser?.name || 'пользователем'), 'info');
    }
  }

  hide() {
    document.getElementById('chatModal').classList.add('hidden');
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    document.getElementById('chatMessages').innerHTML = '';
  }

  listenMessages(chatId) {
    if (this.unsubscribeMessages) this.unsubscribeMessages();
    this.unsubscribeMessages = this.db.collection('chats').doc(chatId).collection('messages')
      .orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
        const messages = [];
        snapshot.forEach(doc => messages.push(doc.data()));
        this.renderMessages(messages);
      });
  }

  renderMessages(messages) {
    const container = document.getElementById('chatMessages');
    container.innerHTML = messages.map(msg => `
      <div class="flex ${msg.senderId === this.currentUser?.uid ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[70%] px-4 py-2 rounded-lg mb-1 ${msg.senderId === this.currentUser?.uid ? 'bg-primary text-white' : 'bg-gray-200 text-gray-900'}">
          <span>${msg.text}</span>
          <span class="ml-2 text-xs opacity-60">${msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString('ru-RU',{hour:'2-digit',minute:'2-digit'}) : ''}</span>
        </div>
      </div>
    `).join('');
    container.scrollTop = container.scrollHeight;
  }

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text || !this.currentChatId || !this.currentUser) return;
    input.value = '';
    await this.db.collection('chats').doc(this.currentChatId).collection('messages').add({
      text,
      senderId: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Push уведомление собеседнику (TODO: реализовать через notification-manager.js)
  }
}

// Глобальный экземпляр чата
window.chatWidget = new ChatWidget();

// Глобальная функция для вызова чата из карточки вакансии
window.startChatWithUser = async function(userId, initialMsg, vacancyId) {
  // Поиск или создание чата между текущим пользователем и userId
  const currentUser = firebase.auth().currentUser;
  if (!currentUser) {
    if (window.registrationSystem) window.registrationSystem.showLoginModal();
    return;
  }
  // Уникальный chatId (user1_user2 или vacancyId_user1_user2)
  const chatId = vacancyId ? `${vacancyId}_${[currentUser.uid, userId].sort().join('_')}` : [currentUser.uid, userId].sort().join('_');
  // Получить данные собеседника (можно расширить)
  let toUser = { name: 'Пользователь' };
  try {
    const userDoc = await firebase.firestore().collection('users').doc(userId).get();
    if (userDoc.exists) toUser = userDoc.data();
  } catch {}
  window.chatWidget.open({chatId, toUser, vacancyId});
  // Отправить первое сообщение, если задано
  if (initialMsg) {
    await firebase.firestore().collection('chats').doc(chatId).collection('messages').add({
      text: initialMsg,
      senderId: currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
};

window.ChatWidget = ChatWidget; 