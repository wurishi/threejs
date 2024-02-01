const CopyWebpackPlugin = require('copy-webpack-plugin');
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

const copyList = [
    'webgl-utils.js',
    'm3.js',
    'm4.js',
    'primitives.js',
    'texture-utils.js',
    'chroma.min.js',
];

module.exports = [
    new CopyWebpackPlugin({
        patterns: copyList.map((js) => ({
            from: path.join(__dirname, './', js),
        })),
    }),
    new HTMLWebpackPlugin({
        templateContent: `<html>
      <head>
      <script src="./dll/main.dll.js"></script>
      ${copyList.map((js) => '<script src="./' + js + '"></script>').join('')}
      </head>
      <body>
        
      </body>
    </html>`,
    }),
];
