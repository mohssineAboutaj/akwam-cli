import { nodeResolve } from "@rollup/plugin-node-resolve";
import { eslint } from "rollup-plugin-eslint";

// import eslint config
const eslintConfig = require("./.eslintrc");

// global plugins
const globalPlugins = [nodeResolve(), eslint(eslintConfig)];

// export
module.exports = [
  {
    input: "./src/cli.js",
    output: {
      file: "./lib/cli.js",
      format: "cjs",
    },
    plugins: [...globalPlugins],
  },
  {
    input: "./src/downlaod.js",
    output: {
      file: "./lib/downlaod.js",
      format: "cjs",
    },
    plugins: [...globalPlugins],
  },
  {
    input: "./src/fetch.js",
    output: {
      file: "./lib/fetch.js",
      format: "cjs",
    },
    plugins: [...globalPlugins],
  },
  {
    input: "./src/helpers.js",
    output: [
      {
        file: "./lib/helpers.js",
        format: "umd",
      },
      {
        file: "./lib/helpers.esm.js",
        format: "esm",
      },
    ],
    plugins: [...globalPlugins],
  },
];
