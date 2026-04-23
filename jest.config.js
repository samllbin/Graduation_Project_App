module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@rneui|react-native-size-matters|\\.pnpm)/)',
    'node_modules/.pnpm/(?!(react-native|@react-native\\+[^/]+|@rneui\\+[^/]+|react-native-size-matters)@)',
  ],
};
