const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    server: "./src/server.ts",
  },
  devtool: 'source-map',
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  externals: {
    "@coral-xyz/anchor": "require('@coral-xyz/anchor')",
    "pg-hstore": "commonjs pg-hstore",
    sequelize: "require('sequelize')",
  },
};
