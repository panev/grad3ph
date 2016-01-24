var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: [
    './app/main.js'
  ],
  output: {
    path: path.join(__dirname, 'build'),
    publicPath: '/',
    filename: 'bundle.js'
  },
  plugins: [
    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.NoErrorsPlugin()
  ],
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        exclude: /node_modules/,
        query: {
          presets: ['es2015']
        }
      }
    ],
    preLoaders: [
      //{
      //  test: /\.js$/,
      //  loader: "eslint-loader",
      //  exclude: /node_modules/
      //}
    ]
  }
};
