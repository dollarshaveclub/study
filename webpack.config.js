
const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: './build/study.js',
    library: 'umd',
    umdNamedDefine: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        include: path.resolve('src'),
        loader: require.resolve('babel-loader'),
      },
    ],
  },
};
