var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var APP_DIR = __dirname + '/public';

var DIST_DIR = __dirname + '/dist';

var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: APP_DIR + '/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  entry: {
    'bundle': APP_DIR + '/js/main.js',
    //'static': APP_DIR + '/webpack-assets.js'
  },
  output: {
    path: DIST_DIR,
    filename: "/js/bundle.js"
  },
  module: {
    preLoaders: [
      {test: /\.jsx?$/, loader: 'eslint-loader', exclude: /node_modules/}
    ],
    loaders: [
      // file loader copies matching assets to the output directory
      {test: /\.json$|\.jpe?g$|\.gif$|\.png$|\.svg|\.woff|\.ttf|\.eot|\.wav$|\.mp3$/, loader: "file-loader"},
      {test: /\.css$/, loader: "style-loader!css-loader"},
      {test: /\.less$/, loader: "style!css!less"},
      {test: /\.js$/, include: APP_DIR, loader: "babel-loader", exclude: /node_modules/},
    ]
  },
  plugins: [
    HTMLWebpackPluginConfig
  ]
};
