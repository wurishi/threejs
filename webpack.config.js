const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const options = webpack({
  entry: './index.js',
  devServer: {
    open: true,
    port: 9000,
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/dll/main.manifest.json'),
    }),
    new HTMLWebpackPlugin({
      // inject: 'head',
      //${htmlWebpackPlugin.tags.bodyTags}
      templateContent: ({ htmlWebpackPlugin }) => `
      <html>
        <head>
        <script src="./dll/main.dll.js"></script>
        </head>
        <body>
          
        </body>
      </html>
      `,
      // templateParameters: {
      //   js: ['./dist/main.dll.js'],
      // },
    }), //
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}).options;

module.exports = options;
