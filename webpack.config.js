// @ts-check

"use strict";

const ReplacePlugin = require("replace-in-file-webpack-plugin");
const path = require("path");

/** @type {import('webpack').Configuration} */
const config = {
  // vscode extensions run in a Node.js-context
  // => https://webpack.js.org/configuration/node/
  target: "node",

  // => https://webpack.js.org/configuration/entry-context/
  entry: "./src/extension.ts",

  output: {
    // Bundle is stored in the 'out' folder (check package.json)
    // => https://webpack.js.org/configuration/output/
    path: path.resolve(__dirname, "out"),
    filename: "extension.js",
    libraryTarget: "commonjs2",
    devtoolModuleFilenameTemplate: "../[resource-path]"
  },

  devtool: "source-map",

  externals: {
    // The vscode-module is created on-the-fly and must be excluded.
    // Add other modules that cannot be webpack'ed.
    // => https://webpack.js.org/configuration/externals/
    vscode: "commonjs vscode"
  },

  resolve: {
    extensions: [".ts", ".js", ".json"]
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: "ts-loader"
          }
        ]
      }
    ]
  },

  plugins: [
    /**
     * `@typescript/vfs` uses `path.dirname(require.resolve('typescript'))`
     * But webpack replaces this with `path.dirname(336)` which is invalid!
     * => replace the original code with `eval()` to make it work
     *
     * See https://github.com/webpack/webpack/issues/1554
     */
    new ReplacePlugin([
      // This replaces the source code before compilation.
      {
        dir: "node_modules/@typescript/vfs/dist",
        files: ["vfs.cjs.development.js", "vfs.esm.js"],
        rules: [
          {
            // We carefully match this with parenthesis to avoid a recursion.
            search: "(require.resolve('typescript'))",
            replace: `(eval("require.resolve('typescript')"))`
          }
        ]
      },
      {
        dir: "node_modules/@typescript/vfs/dist",
        files: ["vfs.cjs.production.min.js"],
        rules: [
          {
            // The production build uses different quotes.
            search: '(require.resolve("typescript"))',
            replace: `(eval("require.resolve('typescript')"))`
          }
        ]
      }
    ])
  ]
};

module.exports = config;
