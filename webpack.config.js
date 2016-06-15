
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var pathJs            = './public/scripts/';
//var pathLib           = './public/lib/';

module.exports = {
  entry: {
    index: [
      pathJs+"main.js",
      //'./public/css/css/style.css',
    ],

  },

  output: {
    path: './public/dist/',
    filename: 'bundle.js'
  },

  // Resolve the `./src` directory so we can avoid writing ../../styles/base.css
  resolve: {
    modulesDirectories: ['node_modules', './public'],
    extensions: ['', '.js', '.jsx']
  },

  // Instruct webpack how to handle each file type that it might encounter
  module: {
    loaders:[
      { test: /\.js[x]?$/, exclude: /node_modules/, loader: 'babel-loader' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('style-loader', 'css-loader') },
      { test: /\.(ico|jpe?g|png|svg|gif)$/, loader: 'file-loader?name=images/[name].[ext]' },
      { test: /\.(woff|woff2|ttf|otf|eot\?#.+|svg#.+)$/, loader: 'file-loader?name=fonts/[name].[ext]' }
    ]
  },

  // This plugin moves all the CSS into a separate stylesheet
  plugins: [
    new ExtractTextPlugin('app.css')
  ]
};
