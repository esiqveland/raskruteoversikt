var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var APP_DIR = __dirname + '/public';

var DIST_DIR = __dirname + '/dist';

console.log('APP_DIR=' + APP_DIR);
console.log('DIST_DIR=' + DIST_DIR);

var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: APP_DIR + '/index.html',
  filename: 'index.html',
  inject: 'body'
});

module.exports = {
  mode: 'development', // development|production
  entry: {
    'bundle': APP_DIR + '/js/main.js',
    //'static': APP_DIR + '/webpack-assets.js'
  },
  output: {
    path: DIST_DIR,
    filename: "bundle-[hash].js"
  },
  module: {
    rules: [
      { test: /\.jsx?$/, enforce: "pre", loader: 'eslint-loader', exclude: /node_modules/ },
      // file loader copies matching assets to the output directory
      { test: /\.json$|\.jpe?g$|\.gif$|\.png$|\.svg|\.woff|\.ttf|\.eot|\.wav$|\.mp3$/, loader: "file-loader" },
      { test: /\.css$/, use: [ "style-loader", "css-loader" ]},
      { test: /\.less$/, use: [ "style-loader", "css-loader", "less-loader" ] },
      { test: /\.(js|jsx)$/, loader: "babel-loader", exclude: /node_modules/, options: { babelrc: true } },
    ]
  },
  plugins: [
    HTMLWebpackPluginConfig,
  ]
};
