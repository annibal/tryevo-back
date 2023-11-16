const path = require('path');
const CopyPlugin = require("copy-webpack-plugin");

const outputPath = path.resolve(__dirname, 'build');

module.exports = {
  entry: './api.js',
  mode: 'development',
  target: 'node17.9',
  output: {
    path: outputPath,
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
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, "src/controllers/emailTemplates"),
          to: path.resolve(outputPath, "emailTemplates"),
        }
      ],
    }),
  ],
}