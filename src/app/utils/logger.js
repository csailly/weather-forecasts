const bunyan = require('bunyan')

module.exports = (subname) => {
  const logger = bunyan.createLogger({ name: 'Forecast App', src: true })

  if (subname) {
    return logger.child({ subname })
  }

  return logger
}
