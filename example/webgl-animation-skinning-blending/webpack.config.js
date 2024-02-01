const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const options = webpack({
  entry: './index.js',
  devServer: {
    open: true,
    port: 9000,
    contentBase: path.join(__dirname, 'dist'),
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/dll/main.manifest.json'),
    }),
    new HTMLWebpackPlugin({
      title: 'blending',
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
