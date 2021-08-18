const path = require('path');
const package = require('./package.json');
const webpack = require('webpack');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'hal9-utils': './index.js',
    'hal9-utils.min': './index.js',
  },
  devtool: "source-map",
  output: {
    filename: '[name].js',
    library: {
      name: 'hal9',
      type: 'assign-properties',
      export: 'default',
    },
    path: path.resolve(__dirname, 'dist'),
  },
  mode: 'none',
  plugins: [
  ],
  module: {
  },
  optimization: {
    minimize: true,
    minimizer: [new UglifyJsPlugin({
      include: /\.min\.js$/
    })]
  }
};
