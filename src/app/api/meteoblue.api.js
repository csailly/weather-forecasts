var rp = require('request-promise')
const Rx = require('rxjs/Rx')
const cheerio = require('cheerio')
const debug = require('debug')('weather:api:meteoblue')
const logger = require('utils/logger')('weather:api:meteoblue')

const getForecast = ({ lat, lon }) => {
  logger.info('IN getForecast', { lat, lon })
  return Rx.Observable.create(observer => {
    getAllDays({ lat, lon })
      .then(_ => {
        observer.next(_)
        observer.complete()
      })
      .catch(err => {
        logger.error('Error with the request:', err.message)
        observer.error(new Error(err.message))
      })
  })
}

const getAllDays = ({ lat, lon }) => {
  let promises = []
  promises.push(getOneDay({ lat, lon, day: 1 }))
  promises.push(getOneDay({ lat, lon, day: 2 }))
  promises.push(getOneDay({ lat, lon, day: 3 }))
  promises.push(getOneDay({ lat, lon, day: 4 }))
  promises.push(getOneDay({ lat, lon, day: 5 }))
  promises.push(getOneDay({ lat, lon, day: 6 }))
  promises.push(getOneDay({ lat, lon, day: 7 }))
  return Promise.all(promises)
    .then(_ => {
      return {
        lat,
        lon,
        forecasts: _.reduce((res, item) => {
          res.dates[item.date] = { times: item.forecasts }
          return res
        }, { dates: {} })
      }
    })
    .catch(err => {
      throw (err)
    })
}

const getOneDay = ({ lat, lon, day }) => {
  let uri = `https://www.meteoblue.com/fr/meteo/prevision/semaine/${lat}N${lon}E?day=${day}`
  debug(`Call url ${uri}`)

  const options = {
    uri,
    transform: (body) => cheerio.load(body)
  }

  return rp(options)
    .then($ => parseBody($))
    .catch(err => {
      throw (err)
    })
}

const parseBody = ($) => {
  debug('Parsing body')
  let context = $('.tab_detail')
    .filter((i, elem) => $(elem).hasClass('active'))

  let date = readDate($, context)
  let times = readTimes($, context)
  let weatherDescription = readWeatherDescriptions($, context)
  let temps = readTemps($, context)
  let windchills = readWindchills($, context)
  let winddirs = readWinddirs($, context)
  let windspeeds = readWindspeeds($, context)
  let humidities = readHumidities($, context)
  let precips = readPrecips($, context)
  let precipsProbs = readPrecipsProbs($, context)

  let forecasts = {}

  debug('Processing datas')
  times.forEach((time, i) => {
    forecasts[time] = {
      weatherDescription: weatherDescription[i],
      temp: parseInt(temps[i]),
      windchill: parseInt(windchills[i]),
      winddir: winddirs[i],
      windspeed: parseInt(windspeeds[i].split('-')[0]),
      windgust: parseInt(windspeeds[i].split('-')[1]),
      precips: parseInt(precips[i]) | 0,
      precipsProb: parseInt(precipsProbs[i].replace('%', ''))
    }
  })

  debug('Processing completed')
  return { date, forecasts }
}

const readDate = ($, context) => $('.times > th', context)
  .find($('time'))
  .attr('datetime')

const readTimes = ($, context) => {
  const result = []
  $('.times > td', context)
    .each((i, elem) => {
      result.push($('time', elem).attr('datetime'))
    })
  return result
}

const readWeatherDescriptions = ($, context) => {
  const result = []
  $('.icons > td', context)
    .each((i, elem) => {
      result.push($('.picon', elem).attr('title'))
    })
  return result
}

const readTemps = ($, context) => {
  const result = []
  $('.temperatures > td', context)
    .each((i, elem) => {
      result.push($('.cell', elem).text().replace('°', ''))
    })
  return result
}

const readWindchills = ($, context) => {
  const result = []
  $('.windchills > td', context)
    .each((i, elem) => {
      result.push($('.cell', elem).text().replace('°', ''))
    })
  return result
}

const readWinddirs = ($, context) => {
  const result = []
  $('.winddirs > td', context)
    .each((i, elem) => {
      result.push($('.winddir', elem).text())
    })
  return result
}

const readWindspeeds = ($, context) => {
  const result = []
  $('.windspeeds > td', context)
    .each((i, elem) => {
      result.push($('.cell', elem).text())
    })
  return result
}

const readHumidities = ($, context) => {
  debug('Parsing humidities')
  const result = []
  $('.humidities > td', context)
    .each((i, elem) => {
      result.push($('.cell', elem).text())
    })
  debug(`humidities => ${result}`)
  return result
}

const readPrecips = ($, context) => {
  const result = []
  $('.precips', context)
    .filter((i, elem) => !$(elem).hasClass('precip-hourly-title'))
    .find('td .cell')
    .each((i, elem) => {
      result.push($(elem).text())
    })
  return result
}

const readPrecipsProbs = ($, context) => {
  const result = []
  $('.precipprobs > td', context)
    .each((i, elem) => {
      result.push($('.cell', elem).text())
    })
  return result
}

module.exports.getForecast = getForecast
