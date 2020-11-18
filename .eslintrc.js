module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    jest: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    "prefer-const": ["error"],
  },
  overrides: [
    {
      files: ["__tests__/*.js"],
    },
  ],
};