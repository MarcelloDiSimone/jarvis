const { config: loadEnv } = require('dotenv');
const webpack = require('webpack');

loadEnv({ path: '.env' });

const clientEnvironment = {
  AI_WEBHOOK_URL: process.env.AI_WEBHOOK_URL ?? '',
};

module.exports = (config) => {
  config.plugins ??= [];
  config.plugins.push(
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(clientEnvironment),
    }),
  );

  return config;
};
