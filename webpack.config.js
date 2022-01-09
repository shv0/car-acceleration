const path = require("path");
const HTMLWebpackPlugin = require("html-webpack-plugin");
const MiniCSSExtractPlugin = require("mini-css-extract-plugin");

var styleLoaders = function () {
  let loaders = [
    MiniCSSExtractPlugin.loader,
    "css-loader",
    {
      loader: "postcss-loader",
      options: {
        postcssOptions: {
          plugins: ["autoprefixer"],
        },
      },
    },
    "sass-loader",
  ];
  return loaders;
};

module.exports = {
  context: path.resolve(__dirname, "src"),
  mode: "development",
  entry: "./index.js",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    clean: true,
  },
  plugins: [
    new HTMLWebpackPlugin({
      template: "./index.html",
      inject: "body",
    }),
    new MiniCSSExtractPlugin(),
  ],
  module: {
    rules: [
      {
        test: /\.html$/,
        loader: "html-loader",
/*       
        options: {
          minimize: true,
        },
*/
      },
      {
        test: /\.(css|sass|scss)$/,
        use: styleLoaders(),
      },
    ],
  },
};
