const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')

module.exports = {
  mode: 'development',
  devtool: 'cheap-module-source-map',
  entry: {
    popup: path.resolve('src/popup/popup.tsx'),
    options: path.resolve('src/options/options.tsx'),
  },
  module: {
    rules: [
      {
        use: 'ts-loader',
        test: /\.tsx?$/,
        exclude: /node_modules/,
      },
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/i,
      },
      {
        type: 'asset/resource',
        test: /\.(jpg|jpeg|png|woff|woff2|eof|svg)$/,
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve('src/manifest.json'),
          to: path.resolve('dist'),
        },
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
      ],
    }),
    // new HtmlPlugin({
    //   title: 'React Extension',
    //   filename: 'popup.html',
    //   template: 'src/popup/template.html',
    //   chunks: ['popup'],
    // }),
    ...getHTMLPlugins(['popup', 'options']),
  ],
  resolve: {
    extensions: ['.tsx', '.tx', '.js'],
  },
  output: {
    // filename: 'index.js',
    filename: '[name].js',
    path: path.resolve('dist'),
  },
  // share chynks modulea
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
}

function getHTMLPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
        title: 'React Extension',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  )
}
