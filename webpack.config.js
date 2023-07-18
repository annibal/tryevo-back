const path = require('path');
// const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './api.js',
  mode: 'development',
  target: 'node17.9',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'api.js'
  },
  resolve: {
    extensions: ['.js'],
  },
  module: {
    rules: [
      {
        test: /\.(?:js|mjs|cjs)$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: { "node": "17.9" } }]
            ],
          }
        }
      }
    ]
  }
  // externals: [ nodeExternals() ]
}