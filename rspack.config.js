const { VueLoaderPlugin } = require('vue-loader')

/** @type {import('@rspack/cli').Configuration} */
const config = {
  context: __dirname,
  entry: {
    main: './src/main.js',
  },
  builtins: {
    copy: {
      patterns: ['./public'],
    },
    html: [
      {
        template: './index.html',
      },
    ],
    define: {
      __VUE_OPTIONS_API__: false,
      __VUE_PROD_DEVTOOLS__: false,
    },
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [new VueLoaderPlugin()],
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          experimentalInlineMatchResource: true,
        },
      },
      {
        test: /\.svg/,
        type: 'asset/resource',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: {
                  tailwindcss: {},
                  autoprefixer: {},
                },
              },
            },
          },
        ],
        type: 'css',
      },
    ],
  },
}
module.exports = config
