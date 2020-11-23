// eslint config file
module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2020: true,
    jest: true,
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    "prefer-const": "warn",
    console: "off",
  },
};
