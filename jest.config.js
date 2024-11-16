module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
    "^.+\\.(js|jsx)$": "babel-jest", // 如果你使用 Babel 进行 JavaScript 转换
  },
  transformIgnorePatterns: ["/node_modules/(?!chai)"],
  testMatch: [
    "**/__tests__/**/*.(ts|tsx|js)",
    "**/?(*.)(spec|test).(ts|tsx|js)",
  ],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy",
  },
};
