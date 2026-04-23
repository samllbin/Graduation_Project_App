const mockSessionStore = new Map();

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueId: jest.fn(() => Promise.resolve('mock-device-id')),
  },
}));

jest.mock('react-native-keychain', () => ({
  __esModule: true,
  getGenericPassword: jest.fn(({service}) => {
    if (!mockSessionStore.has(service)) {
      return Promise.resolve(false);
    }
    return Promise.resolve({
      username: 'session',
      password: mockSessionStore.get(service),
    });
  }),
  setGenericPassword: jest.fn((username, password, {service}) => {
    mockSessionStore.set(service, password);
    return Promise.resolve(true);
  }),
  resetGenericPassword: jest.fn(({service}) => {
    mockSessionStore.delete(service);
    return Promise.resolve(true);
  }),
}));
