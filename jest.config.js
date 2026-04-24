module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|@rneui|react-native-size-matters|react-native-image-picker|\\.pnpm)/)',
    'node_modules/.pnpm/(?!(react-native|@react-native\\+[^/]+|@react-navigation\\+[^/]+|@rneui\\+[^/]+|react-native-size-matters|react-native-image-picker)@)',
  ],
};
