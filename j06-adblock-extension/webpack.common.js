const path = require('path')
const CopyPlugin = require('copy-webpack-plugin')
const HtmlPlugin = require('html-webpack-plugin')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
  entry: {
    // process tsx/ts
    background: path.resolve('src/background/background.ts'),
    contentScript: path.resolve('src/contentScript/contentScript.tsx'),
  },
  module: {
    rules: [
      // process txs/ts rule
      {
        use: 'ts-loader',
        test: /\.tsx?$/,
        exclude: /node_modules/,
      },
      // support load .css
      {
        use: ['style-loader', 'css-loader'],
        test: /\.css$/i,
      },
      // 指定 jpg,jpeg ...處理方式
      {
        type: 'asset/resource',
        test: /\.(jpg|jpeg|png|woff|woff2|eot|ttf|svg)$/,
      },
    ],
  },
  plugins: [
    // clean ./dist file
    new CleanWebpackPlugin({
      cleanStaleWebpackAssets: false, //  run when switch product/develop
    }),
    new CopyPlugin({
      patterns: [
        // copy src/static files
        {
          from: path.resolve('src/static'),
          to: path.resolve('dist'),
        },
      ],
    }),
  ],
  resolve: {
    // 處理省略副檔名的檔案
    extensions: ['.tsx', '.ts', '.js'],
  },
  // set output path
  output: {
    filename: '[name].js',
    path: path.resolve('dist'),
  },
  // 依據選擇的mode執行不同的優化
  optimization: {
    // 設定區要分割檔案區塊的項目
    splitChunks: {
      // 表示要用甚麼樣的方式去提取文件
      // async：只處理動態引入的模塊
      // all：不論是動態還是非動態引入的模塊，同時進行優化打包
      // initial：把非動態模塊打包，動態模塊進行優化打包
      // chunks: 'all',
      // 因 contentScript 不能 share Recat module, 所以不執行 chunks(優化) %?%
      chunks(chunk) {
        return chunk.name !== 'contentScript'
      },
    },
  },
}

// change call HtmlPlugin by function
function getHTMLPlugins(chunks) {
  return chunks.map(
    (chunk) =>
      new HtmlPlugin({
        title: 'AdBlock Extension',
        filename: `${chunk}.html`,
        chunks: [chunk],
      })
  )
}
