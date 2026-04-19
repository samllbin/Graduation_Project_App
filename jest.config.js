module.exports = {
  preset: 'react-native',
  modulePathIgnorePatterns: ['<rootDir>/.claude/worktrees/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@rneui|react-native-size-matters)/)',
  ],
};
