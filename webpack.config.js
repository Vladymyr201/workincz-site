import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  entry: {
    // Основной entry point для Next.js
    main: './src/index.js',
    // Модули для статических страниц (временные, будут удалены после миграции)
    auth: './src/modules/auth/index.js',
    jobs: './src/modules/jobs/index.js',
    messaging: './src/modules/messaging/index.js'
  },
  output: {
    path: path.resolve(__dirname, 'public/js'),
    filename: '[name].js',
    clean: true,
    publicPath: '/js/'
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          priority: 5
        }
      }
    },
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: process.env.NODE_ENV === 'production',
            drop_debugger: process.env.NODE_ENV === 'production'
          }
        }
      })
    ]
  },
  module: {
    rules: [
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
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@types': path.resolve(__dirname, 'src/types')
    }
  },
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
  performance: {
    hints: 'warning',
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  },
  // Игнорируем предупреждения о размере бандла в development
  stats: {
    warnings: process.env.NODE_ENV === 'development' ? false : true
  }
}; 