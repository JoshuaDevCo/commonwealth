const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectAttributesPlugin = require('html-webpack-inject-attributes-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

require('dotenv').config();

module.exports = {
  entry: {
    app: ['index.tsx'],
  },
  context: __dirname,
  devServer: {
    headers: {
      P3P: 'CP="Commonwealth does not have a P3P compact privacy policy"',
    },
  },
  output: {
    publicPath: '/build/',
    path: path.join(__dirname, '../build'),
    filename: 'js/[name].[contenthash:8].js',
    chunkFilename: 'js/[name].[chunkhash:8].chunk.js',
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.MIXPANEL_PROD_TOKEN': JSON.stringify(
        process.env.MIXPANEL_PROD_TOKEN || '312b6c5fadb9a88d98dc1fb38de5d900',
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.MIXPANEL_DEV_TOKEN': JSON.stringify(
        process.env.MIXPANEL_DEV_TOKEN || '312b6c5fadb9a88d98dc1fb38de5d900',
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.MAGIC_PUBLISHABLE_KEY': JSON.stringify(
        process.env.MAGIC_PUBLISHABLE_KEY || 'pk_live_EF89AABAFB87D6F4',
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.DISCORD_CLIENT_ID': JSON.stringify(
        // TODO: @Timothee can we remove the default/hardcoded value here?
        process.env.DISCORD_CLIENT_ID || '1034502265664454776',
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.DISCORD_UI_URL': JSON.stringify(
        process.env.DISCORD_UI_URL || 'http://localhost:3000',
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.COSMOS_GOV_V1': JSON.stringify(process.env.COSMOS_GOV_V1),
    }),
    new webpack.DefinePlugin({
      'process.env.FLAG_COMMUNITY_HOMEPAGE': JSON.stringify(
        process.env.FLAG_COMMUNITY_HOMEPAGE,
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.FLAG_PROPOSAL_TEMPLATES': JSON.stringify(
        process.env.FLAG_PROPOSAL_TEMPLATES,
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.ETH_RPC': JSON.stringify(process.env.ETH_RPC),
    }),
    new webpack.DefinePlugin({
      'process.env.FLAG_NEW_ADMIN_ONBOARDING': JSON.stringify(
        process.env.FLAG_NEW_ADMIN_ONBOARDING,
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.FLAG_NEW_SIGN_IN_MODAL': JSON.stringify(
        process.env.FLAG_NEW_SIGN_IN_MODAL,
      ),
    }),
    new webpack.DefinePlugin({
      'process.env.FLAG_COMMUNITY_STAKE': JSON.stringify(
        process.env.FLAG_COMMUNITY_STAKE,
      ),
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../client/index.html'),
      attributes: {
        'data-cfasync': 'false',
      },
    }),
    new HtmlWebpackInjectAttributesPlugin(),
    new webpack.IgnorePlugin({
      resourceRegExp: /^\.\/locale$/,
      contextRegExp: /moment$/,
    }),
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.IgnorePlugin({ resourceRegExp: /\.md$/ }),
  ],
  optimization: {
    splitChunks: {
      chunks: 'all',
      // TODO: Commented out packages need to be code split. Commented out for now so that webpack can tree shake the imports
      cacheGroups: {
        ethersAsync: {
          test: /[\\/]node_modules[\\/](ethers)[\\/]/,
          name: 'ethersAsync',
          chunks: 'all',
        },
        ethereumAsync: {
          test: /[\\/]node_modules[\\/](@audius|web3|web3-eth-accounts|@walletconnect|ethereumjs-abi)[\\/]/,
          name: 'ethereumAsync',
          chunks: 'all',
        },
        terra: {
          test: /[\\/]node_modules[\\/](@terra-money|terra-proto|legacy-proto)[\\/]/,
          name: 'terra',
          chunks: 'all',
        },
        cosmos: {
          test: /[\\/]node_modules[\\/](@cosmjs|@tendermint|amino-js|supercop\.js|tendermint|libsodium)[\\/]/,
          name: 'cosmos',
          chunks: 'all',
        },
        solana: {
          test: /[\\/]node_modules[\\/](@solana)[\\/]/,
          name: 'solana',
          chunks: 'all',
        },
        snapshot: {
          test: /[\\/]node_modules[\\/](@apollo)[\\/]/,
          name: 'snapshot',
          chunks: 'all',
        },
        // ethereum: {
        //   test: /[\\/]node_modules[\\/](@ethersproject)[\\/]/,
        //   name: 'ethereum',
        //   chunks: 'all',
        // },
        // near: {
        //   test: /[\\/]node_modules[\\/](near-api-js)[\\/]/,
        //   name: 'near',
        //   chunks: 'all',
        // },
        // cosmosTypes: {
        //   test: /[\\/]node_modules[\\/](cosmjs-types)[\\/]/,
        //   name: 'cosmosTypes',
        //   chunks: 'all',
        // },
        // polkadot: {
        //   test: /[\\/]node_modules[\\/](@polkadot)[\\/]/,
        //   name: 'polkadot',
        //   chunks: 'all',
        // },
      },
    },
  },
  resolve: {
    plugins: [new TsconfigPathsPlugin({})],
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.svg'],
    modules: [
      '../client/scripts',
      '../client/styles',
      '../shared',
      'node_modules', // local node modules
      '../node_modules', // global node modules
    ],
    fallback: {
      fs: false,
      net: false,
      zlib: require.resolve('browserify-zlib'),
      crypto: require.resolve('crypto-browserify'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: require.resolve('os-browserify/browser'),
      vm: require.resolve('vm-browserify'),
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    rules: [
      {
        // ignore ".spec.ts" test files in build
        test: /^(?!.*\.spec\.ts$).*(?:\.ts)$/,

        loader: 'esbuild-loader',
        options: {
          loader: 'ts',
        },
      },
      {
        // ignore ".spec.ts" test files in build
        test: /^(?!.*\.spec\.tsx$).*(?:\.tsx)$/,
        include: [path.resolve(__dirname, '../client')],
        loader: 'esbuild-loader',
        options: {
          loader: 'tsx',
          jsxFragment: 'React.Fragment',
        },
      },
      {
        test: /\.(ico|jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2)(\?.*)?$/,
        type: 'asset',
      },
      {
        test: /\.s?css$/i,
        use: ['style-loader', 'css-loader', 'fast-sass-loader'],
        sideEffects: true,
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
