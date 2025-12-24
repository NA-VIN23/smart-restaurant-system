module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // Only run TypeScript tests under `src/` (ignore compiled JS under `dist/`)
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.spec.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
};
