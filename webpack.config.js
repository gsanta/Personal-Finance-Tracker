const { globSync } = require('glob');
const path = require('path');
const webpack = require('webpack');
const { WebpackAssetsManifest } = require('webpack-assets-manifest');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const packPath = path.resolve(__dirname, 'frontend/src');
const WDS_PORT = 3013;

const entry = globSync(path.join(packPath, '**', 'entry.tsx')).reduce((entries, file) => {
  const { name, dir } = path.parse(file);
  const entry = path.join(path.relative(packPath, dir), name);
  entries[entry] = [`./webpack/loaders/entry.js!${file}`];
  return entries;
}, {});

function plugins({ isProduction }) {
  const plugins = [
    new WebpackAssetsManifest({
      entrypoints: true,
      writeToDisk: isProduction,
      output: 'manifest.json',
      entrypointsUseAssets: true,
      publicPath: isProduction ? true : `http://localhost:${WDS_PORT}/version-dev/`,
    })
  ];

  if (!isProduction) {
    const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
    plugins.push(new ReactRefreshWebpackPlugin());
  }

  plugins.push(
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[contenthash:8].css',
      chunkFilename: 'css/[id]-[contenthash:8].css',
    }),
    new webpack.SourceMapDevToolPlugin({
      noSources: false,
      filename: '[file].map',
    }),
  );

  return plugins;
}

function cssLoader() {
  const loaders = [];
  loaders.push(MiniCssExtractPlugin.loader);
  loaders.push('css-loader');
  return loaders;
}

function tsLoader({ isProduction }) {
  const loader = {
    loader: 'babel-loader',
    options: {
      babelrc: false,
      presets: [
        ['@babel/preset-env', { useBuiltIns: 'entry', corejs: '3.22' }],
        ['@babel/preset-react', { runtime: 'automatic', development: !isProduction }],
        '@babel/preset-typescript',
      ],
    },
  };
  return [loader];
}

function devtool({ isProduction, isDevServer }) {
  if (isProduction) {
    return false;
  }

  return 'inline-source-map';
}


module.exports = (_env, argv) => {
  const isProduction = argv.mode === 'production' || process.env.NODE_ENV === 'production';
  const opts = { isProduction };

  return {
    mode: isProduction ? 'production' : 'development',
    entry,
    devServer: {
      port: WDS_PORT,
      hot: true,
      headers: { 'Access-Control-Allow-Origin': '*' },
      static: false,
      allowedHosts: ['localhost', '127.0.0.1'],
      client: {
        overlay: { runtimeErrors: false },
      },
      devMiddleware: { publicPath: '/version-dev/' },
    },
    target: 'web',
    devtool: devtool(opts),
    plugins: plugins(opts),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
      // needed for absoulte imports to work
      plugins: [new TsconfigPathsPlugin({ configFile: './tsconfig.json' })],
    },
    module: {
      rules: [
        {
          test: [/\.tsx?$/, /\.[cm]?js$/],
          use: tsLoader(opts),
          include: [
            path.resolve(__dirname, 'frontend'),
          ],
        },
        {
          test: /\.css$/,
          use: cssLoader(opts),
        },
        {
          test: [/\.gif$/, /\.jpe?g$/, /\.png$/, /\.ico$/, /\.eot$/, /\.ttf$/, /\.woff$/, /\.woff2$/, /\.svg$/],
          type: 'asset/resource',
          generator: {
            filename: 'media/images/[name]-[hash][ext][query]',
          },
        }
      ],
    },
    output: {
      filename: 'js/[name]-[contenthash].js',
      chunkFilename: 'js/[name]-[contenthash].chunk.js',
      path: path.resolve(__dirname, 'public/packs'),
      publicPath: 'auto',
    },
    optimization: {
      splitChunks: {
        chunks: 'all',
      },
      runtimeChunk: 'single',
    },
  };
};
