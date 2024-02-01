const webpack = require('webpack');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const options = webpack({
  entry: './index.ts',
  devtool: 'cheap-eval-source-map',
  devServer: {
    open: true,
    port: 9000,
    contentBase: path.join(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/dll/main.manifest.json'),
    }),
    new HTMLWebpackPlugin({
      templateContent: `<html>
      <head>
      <script src="./dll/main.dll.js"></script>
      </head>
      <body>
        
      </body>
    </html>`,
    }), //
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}).options;

module.exports = options;
