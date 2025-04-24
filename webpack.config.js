const path = require("path");
const glob = require("glob");

const entries = Object.fromEntries(
  glob.sync("./src/lambda/**/*.ts").map(relativePath => {
    const parsed = path.parse(relativePath);
    const fileName = parsed.name; // Chỉ lấy tên file
    const absolutePath = path.resolve(__dirname, relativePath);
    return [fileName, absolutePath]; // Sử dụng tên file làm key
  })
);

module.exports = {
  mode: "production",
  target: "node18",
  entry: entries,
  resolve: { extensions: [".ts", ".js"] },
  module: {
    rules: [
      { test: /\.ts$/, loader: "ts-loader", exclude: /node_modules/ },
    ],
  },
  output: {
    path: path.resolve(__dirname, "src/build/lambda"),
    filename: "[name].mjs", // Sử dụng key từ entries làm tên file
    library: { type: "module" },
    module: true,
  },
  experiments: { outputModule: true },
  externalsType: "node-commonjs",
  optimization: {
    minimize: true,
    splitChunks: false,
    runtimeChunk: false,
    concatenateModules: true,
  },
};
