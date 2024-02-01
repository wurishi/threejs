const webpack = require('webpack');
const path = require('path');
const plugins = require('../webpack-plugins');

const options = webpack({
  entry: './index.ts',
  devtool: 'cheap-eval-source-map',
  devServer: {
    open: true,
    port: 9090,
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
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new webpack.DllReferencePlugin({
      context: __dirname,
      manifest: require('./dist/dll/main.manifest.json'),
    }),
    ...plugins,
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
}).options;

module.exports = options;
