import { nodeResolve } from "@rollup/plugin-node-resolve";
import { eslint } from "rollup-plugin-eslint";

// import eslint config
const eslintConfig = require("./.eslintrc");

// global options
const globalOptions = {
  plugins: [nodeResolve(), eslint(eslintConfig)],
};

// export
module.exports = [
  {
    input: "./src/cli.js",
    output: {
      file: "./lib/cli.js",
      format: "cjs",
    },
    ...globalOptions,
  },
  {
    input: "./src/helpers.js",
    output: {
      file: "./lib/helpers.js",
      format: "umd",
    },
    ...globalOptions,
  },
];
