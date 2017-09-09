/**
 * Application configuration module.
 * Config variables are considered in the following order:
 * 1. OS environment variable (PORT only)
 * 2. Profile specific config file based on NODE_ENV OS environment variable
 * 3. Default config file
 * 
 * Config files can be in json or yaml (.yml) formats. Yaml formatted files will be prior to json formatted file
 * Each file will suceesively override properties from previous file
 */
const yaml = require('js-yaml')
const fs = require('fs')
const logger = require('utils/logger')('weather:config')
const path = require('path')

const loadYamlFile = filename => {
  try {
    return yaml.safeLoad(
      fs.readFileSync(path.join(__dirname, filename + '.yml'), 'utf8')
    )
  } catch (e) {
    return undefined
  }
}

const loadJsonFile = filename => {
  try {
    return require('./' + filename + '.json')
  } catch (e) {
    return undefined
  }
}

const loadConfigFile = filename => {
  return loadYamlFile(filename) || loadJsonFile(filename) || {}
}

const defaultFileConfig = loadConfigFile('config')

let environmentSpecificFileConfig = {}

switch (process.env.NODE_ENV) {
  case 'production':
    environmentSpecificFileConfig = loadConfigFile('config-prod')
    break
  case 'development':
    environmentSpecificFileConfig = loadConfigFile('config-dev')
    break
}

const finalConfig = Object.assign(
  {},
  defaultFileConfig,
  environmentSpecificFileConfig
)

if (process.env.PORT) {
  finalConfig.port = process.env.PORT
}

logger.info(`Application config ${JSON.stringify(finalConfig)}`)

module.exports = finalConfig
