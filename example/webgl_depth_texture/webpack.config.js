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
      <script id="post-vert" type="x-shader/x-vertex">
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      </script>
      <script id="post-frag" type="x-shader/x-fragment">
        #include <packing>
        varying vec2 vUv;
        uniform sampler2D tDiffuse;
        uniform sampler2D tDepth;
        uniform float cameraNear;
        uniform float cameraFar;
        
        float readDepth(sampler2D depthSampler, vec2 coord) {
          float fragCoordZ = texture2D(depthSampler, coord).x;
          float viewZ = perspectiveDepthToViewZ(fragCoordZ, cameraNear, cameraFar);
          return viewZToOrthographicDepth(viewZ, cameraNear, cameraFar);
        }
        void main() {
          float depth = readDepth(tDepth, vUv);
          gl_FragColor.rgb = 1.0 - vec3(depth);
          gl_FragColor.a = 1.0;
        }
      </script>
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
