var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var APP_DIR = __dirname + '/public';

var DIST_DIR = __dirname + '/dist';

var HTMLWebpackPluginConfig = new HtmlWebpackPlugin({
  template: APP_DIR + '/index.html',
  filename: 'index.html',
  inject: 'body'
});

var elmSource = __dirname + '/frontend';

module.exports = {
  entry: {
    'bundle': APP_DIR + '/js/index.js',
  },
  output: {
    path: DIST_DIR,
    filename: "js/bundle-[hash].js"
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        enforce: "pre",
        exclude: [ /elm-stuff/, /node_modules/ ],
        use: { loader: 'eslint-loader' }
      },
      // file loader copies matching assets to the output directory
      {
        test: /\.json$|\.jpe?g$|\.gif$|\.png$|\.svg|\.woff|\.ttf|\.eot|\.wav$|\.mp3$/,
        use: [ { loader: "file-loader" } ],
      },
      {
        test: /\.css$/,
        use: [ { loader: "style-loader" }, { loader: "css-loader" } ],
      },
      {
        test: /\.less$/,
        use: [ "style-loader", "css-loader", "less-loader" ],
      },
      {
        test: /\.elm$/,
        exclude: [ /elm-stuff/, /node_modules/ ],
        use: [ { loader: 'elm-webpack-loader', options: { debug: true, cwd: elmSource } } ],
      },
      { test: /\.js$/, include: APP_DIR, loader: "babel-loader", exclude: /node_modules/ },
    ],
    noParse: /\.elm$/
  },
  plugins: [
    HTMLWebpackPluginConfig,
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: `"${process.env.NODE_ENV}"`,
      }
    })
  ],
  devServer: {
    inline: true,
    stats: 'errors-only'
  }
};
