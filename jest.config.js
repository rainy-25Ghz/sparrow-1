module.exports = {
  testMatch: ['**/__tests__/**/*.spec.js'],
  runner: 'jest-electron/runner',
  testEnvironment: 'jest-electron/environment',
  testPathIgnorePatterns: [
    '<rootDir>/__tests__/plot/*',
  ],
};
