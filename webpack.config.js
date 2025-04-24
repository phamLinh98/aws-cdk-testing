const path = require("path");
module.exports = {
  mode: "production",
  target: "node18",
  entry: {
    "get-user": "./src/lambda/get-user.ts",
    "get-upload-status": "./src/lambda/get-upload-status.ts",
  },
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },
    ],
  },
  output: {
    path: path.resolve(__dirname, "src/build/lambda"),
    filename: "[name].mjs",
    library: { type: "module" },
    module: true,               // giữ ESM
  },
  experiments: { outputModule: true },
  externalsType: "node-commonjs",
};