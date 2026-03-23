const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack'); // 添加这个

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = (env, argv) => {
  const isDevelopment = argv.mode === 'development';
  
  return {
    mode: isDevelopment ? 'development' : 'production',
    devtool: isDevelopment ? 'eval-source-map' : false,
    
    entry: {
      'sykit-ui': './src/index.js'
    },
    
    output: {
      path: resolve('dist'),
      filename: '[name].bundle.js',
      clean: true
    },
    
    resolve: {
      extensions: ['.js', '.vue', '.json'],
      alias: {
        'vue$': 'vue/dist/vue.esm.js',
        '@': resolve('src')
      }
    },
    
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          options: {
            hotReload: isDevelopment
          }
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            'vue-style-loader',  // 注意顺序：从右到左
        'css-loader',
        'postcss-loader'  // 添加 postcss-loader
          ]
        },
        {
          test: /\.(eot|svg|ttf|woff|woff2)$/,
          type: 'asset/resource',
          generator: {
            filename: 'fonts/[name][ext]'
          }
        }
      ]
    },
    
    plugins: [
      new VueLoaderPlugin(),
      // 只在开发环境添加 HMR 插件
      ...(isDevelopment ? [new webpack.HotModuleReplacementPlugin()] : [])
    ],
    
    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: !isDevelopment,
            },
          },
        }),
      ],
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    },
    
    devServer: {
      static: {
        directory: resolve('public'),
      },
      port: 8080,
      hot: false,  // 禁用 HMR，避免错误
      liveReload: true,  // 使用传统的 live reload
      open: true,
      client: {
        overlay: true,
        progress: true,
        logging: 'info',  // 添加日志输出
      },
      historyApiFallback: true,
      devMiddleware: {
        writeToDisk: true,  // 可选：写入磁盘以便调试
      }
    },
    
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    }
  };
};