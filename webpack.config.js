const path = require("path");
const glob = require("glob");

const entries = Object.fromEntries(
  glob.sync("./src/lambda/**/*.ts").map(relativePath => {
    const parsed = path.parse(relativePath);
    const relativeDir = path.relative("./src/lambda", parsed.dir); // Đường dẫn tương đối từ src/lambda
    const fileName = path.join(relativeDir, parsed.name); // Giữ nguyên cấu trúc thư mục
    const absolutePath = path.resolve(__dirname, relativePath);
    return [fileName, absolutePath]; // Sử dụng cấu trúc thư mục làm key
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
    path: path.resolve(__dirname, "src/build/lambda"), // Thư mục đầu ra
    filename: "[name].mjs", // Giữ nguyên cấu trúc thư mục
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