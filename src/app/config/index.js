/**
 * Application configuration module.
 * Will load config in order of priority :
 * - default config json file
 * - environment specific config file
 * - enviroment variable (PORT only)
 * Each file will suceesively override properties from previous file
 */
const logger = require('utils/logger')('weather:config')

const defaultFileConfig = require('./config')
let environmentSpecificFileConfig = {}

switch (process.env.NODE_ENV) {
  case 'production':
    environmentSpecificFileConfig = require('./config.prod')
    break;
  case 'development':
    environmentSpecificFileConfig = require('./config.dev')
    break;
}

const finalConfig = Object.assign(defaultFileConfig, environmentSpecificFileConfig)

if (process.env.PORT) {
  finalConfig.port = process.env.PORT
}

logger.info(finalConfig)

module.exports = finalConfig
