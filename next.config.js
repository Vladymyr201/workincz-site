/** @type {import('next').NextConfig} */
const nextConfig = {
  // Экспериментальные функции
  experimental: {
    // Оптимизация изображений
    optimizeCss: true,
    // Улучшенная производительность
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Оптимизация изображений
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com',
      'graph.facebook.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Оптимизация производительности
  compiler: {
    // Удаляем console.log в production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Настройки для PWA
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // Редиректы
  async redirects() {
    return [
      {
        source: '/auth/login.html',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/auth/register.html',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/dashboard.html',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/jobs.html',
        destination: '/jobs',
        permanent: true,
      },
    ];
  },

  // Перезапись маршрутов
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/jobs/:path*',
        destination: '/api/jobs/:path*',
      },
      {
        source: '/api/user/:path*',
        destination: '/api/user/:path*',
      },
    ];
  },

  // Настройки для Firebase
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Оптимизация бандлов
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Оптимизация для Firebase
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Оптимизация для изображений
    config.module.rules.push({
      test: /\.(png|jpe?g|gif|svg)$/i,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 8192,
            publicPath: '/_next/static/images/',
            outputPath: 'static/images/',
          },
        },
      ],
    });

    // Оптимизация для шрифтов
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      use: [
        {
          loader: 'file-loader',
          options: {
            publicPath: '/_next/static/fonts/',
            outputPath: 'static/fonts/',
          },
        },
      ],
    });

    return config;
  },

  // Настройки для TypeScript
  typescript: {
    // Игнорируем ошибки TypeScript в production для быстрого деплоя
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // Настройки для ESLint
  eslint: {
    // Игнорируем ошибки ESLint в production для быстрого деплоя
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },

  // Настройки для статической генерации
  trailingSlash: false,
  generateEtags: false,

  // Настройки для кеширования
  onDemandEntries: {
    // Период времени (в мс), в течение которого страница будет оставаться в буфере
    maxInactiveAge: 25 * 1000,
    // Количество страниц, которые должны быть одновременно буферизованы
    pagesBufferLength: 2,
  },

  // Настройки для сжатия
  compress: true,

  // Настройки для анализа бандлов
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config) => {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
      return config;
    },
  }),
};

module.exports = nextConfig; 