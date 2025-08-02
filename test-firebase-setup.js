import { vi } from 'vitest';

// Глобальные моки для Firebase Admin SDK
const mockFirestore = {
  collection: vi.fn((name) => ({
    doc: vi.fn((id) => ({
      get: vi.fn(() => Promise.resolve({ 
        exists: true, 
        data: () => ({ id, name: 'test' }) 
      })),
      set: vi.fn(() => Promise.resolve()),
      update: vi.fn(() => Promise.resolve()),
      delete: vi.fn(() => Promise.resolve()),
    })),
    add: vi.fn(() => Promise.resolve({ id: 'test-id' })),
    where: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ docs: [] })),
      orderBy: vi.fn(() => ({
        limit: vi.fn(() => ({
          get: vi.fn(() => Promise.resolve({ docs: [] }))
        }))
      }))
    })),
    orderBy: vi.fn(() => ({
      limit: vi.fn(() => ({
        get: vi.fn(() => Promise.resolve({ docs: [] }))
      }))
    })),
    limit: vi.fn(() => ({
      get: vi.fn(() => Promise.resolve({ docs: [] }))
    })),
    get: vi.fn(() => Promise.resolve({ docs: [] })),
    forEach: vi.fn(),
  })),
  FieldValue: {
    serverTimestamp: vi.fn(() => new Date()),
    increment: vi.fn((value) => value),
  },
};

const mockAuth = {
  verifyIdToken: vi.fn(() => Promise.resolve({ uid: 'test-user' })),
  createCustomToken: vi.fn(() => Promise.resolve('custom-token')),
};

const mockStorage = {
  bucket: vi.fn(() => ({
    file: vi.fn(() => ({
      getSignedUrl: vi.fn(() => Promise.resolve(['https://signed.url'])),
      save: vi.fn(() => Promise.resolve()),
    }))
  }))
};

// Мокаем firebase-admin
vi.mock('firebase-admin', () => ({
  default: {
    initializeApp: vi.fn(() => ({
      firestore: () => mockFirestore,
      auth: () => mockAuth,
      storage: () => mockStorage,
    })),
    apps: [],
    firestore: vi.fn(() => mockFirestore),
    auth: vi.fn(() => mockAuth),
    storage: vi.fn(() => mockStorage),
  },
  firestore: vi.fn(() => mockFirestore),
  auth: vi.fn(() => mockAuth),
  storage: vi.fn(() => mockStorage),
}));

// Мокаем клиентские Firebase модули
vi.mock('https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => []),
  getApp: vi.fn(() => ({})),
}));

vi.mock('https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js', () => ({
  getAuth: vi.fn(() => ({})),
  signInWithPopup: vi.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
  GoogleAuthProvider: vi.fn(() => ({})),
  createUserWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
  signInWithEmailAndPassword: vi.fn(() => Promise.resolve({ user: { uid: 'test-user' } })),
  onAuthStateChanged: vi.fn(() => () => {}),
  signOut: vi.fn(() => Promise.resolve()),
}));

vi.mock('https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js', () => ({
  getFirestore: vi.fn(() => mockFirestore),
  collection: vi.fn(() => mockFirestore.collection()),
  addDoc: vi.fn(() => Promise.resolve({ id: 'test-id' })),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })),
  doc: vi.fn(() => ({})),
  updateDoc: vi.fn(() => Promise.resolve()),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  limit: vi.fn(() => ({})),
  onSnapshot: vi.fn(() => () => {}),
}));

vi.mock('https://www.gstatic.com/firebasejs/10.12.4/firebase-storage.js', () => ({
  getStorage: vi.fn(() => mockStorage),
  ref: vi.fn(() => ({})),
  uploadBytes: vi.fn(() => Promise.resolve({ ref: { getDownloadURL: () => Promise.resolve('https://url') } })),
  getDownloadURL: vi.fn(() => Promise.resolve('https://url')),
}));

vi.mock('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging.js', () => ({
  getMessaging: vi.fn(() => ({})),
  getToken: vi.fn(() => Promise.resolve('test-token')),
  onMessage: vi.fn(() => () => {}),
}));

// Глобальные настройки для тестов
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Экспортируем моки для использования в тестах
export { mockFirestore, mockAuth, mockStorage };