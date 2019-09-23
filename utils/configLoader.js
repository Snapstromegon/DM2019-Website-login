const fs = require('fs');
const path = require('path');
const argv = require('yargs').argv;
const ini = require('ini');

module.exports = function ({ configPath }) {
  const allConfigs = require(configPath);

  const isProduction = argv.production || process.env.NODE_ENV == 'production';

  global.config = isProduction ? allConfigs.production : allConfigs.test;
  config.secrets = require(path.resolve(config.secretConfig));

  config.db.credentials = ini.parse(
    fs.readFileSync(config.db.credentialsFile, 'utf-8')
  )[config.db.credentialsName];
};