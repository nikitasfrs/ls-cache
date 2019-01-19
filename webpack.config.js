module.exports = (env, argv) => ({
  entry: ['./src/index.js'],
    output: {
    path: __dirname + '/dist',
    filename: `ls-cache.${argv.mode === 'production' ? 'min.js' : 'js'}`
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude:  /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  }
})
