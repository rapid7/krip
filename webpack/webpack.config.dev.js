/* eslint-disable import/no-commonjs */

const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const defaultConfig = require('./webpack.config');

const ROOT = path.resolve(__dirname, '..');

module.exports = Object.assign({}, defaultConfig, {
  devServer: {
    contentBase: './dist',
    inline: true,
    port: 3000,
    stats: {
      assets: false,
      chunkModules: false,
      chunks: true,
      colors: true,
      hash: false,
      timings: true,
      version: false,
    },
  },

  entry: path.join(ROOT, 'DEV_ONLY/index.js'),

  externals: undefined,

  module: Object.assign({}, defaultConfig.module, {
    rules: defaultConfig.module.rules.map((rule) => {
      if (rule.loader === 'eslint-loader') {
        return Object.assign({}, rule, {
          options: Object.assign({}, rule.options, {
            emitError: undefined,
            failOnWarning: false,
          }),
        });
      }

      return rule;
    }),
  }),

  node: {
    fs: 'empty',
  },

  plugins: [...defaultConfig.plugins, new HtmlWebpackPlugin()],
});
