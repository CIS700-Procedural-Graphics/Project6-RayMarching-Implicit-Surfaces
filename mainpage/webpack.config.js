module.exports = {
  entry: {
    "/": "./home.js",
    "base/": "./base/main.js",
    "biocrowds/": "./biocrowds/main.js"
  },
  output: {
      path: __dirname,
      filename: "[name]bundle.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      },
      {
        test: /\.less$/,
        loader: "style!css!less"
      },
      {
        test: /\.md$/, 
        loader: "html!markdown" 
      }
    ]
  },
  devtool: 'source-map',
  devServer: {
    port: 7000
  }
};