const request = require('request')
const moment = require('moment')
const Rx = require('rxjs/Rx')
const debug = require('debug')('weather:api:xcweather')
const logger = require('utils/logger')('weather:api:xcweather')

const compass = ['N', 'N', 'NNE', 'NNE', 'NE', 'NE', 'ENE', 'ENE', 'E', 'E', 'E', 'ESE', 'ESE', 'SE', 'SE', 'SSE', 'SSE', 'S', 'S', 'S', 'SSW', 'SSW', 'SW', 'SW', 'WSW', 'WSW', 'W', 'W', 'W', 'WNW', 'WNW', 'NW', 'NW', 'NNW', 'NNW', 'N', 'N']
const symNames = []
symNames.n = ''
symNames['0'] = ''
symNames.t = ''
symNames.f = 'Few Clouds'
symNames.s = 'Scattered Cloud'
symNames.b = 'Broken Cloud'
symNames.o = 'Overcast'
symNames['1'] = ', Drizzle'
symNames['2'] = ', Light Rain'
symNames['3'] = ', Rain'
symNames['4'] = ', Heavy Rain'
symNames['5'] = ', Light Hail'
symNames['6'] = ', Hail'
symNames['7'] = ', Heavy Hail'
symNames['8'] = ', Light Snow'
symNames['9'] = ', Snow'
symNames.a = ', Heavy Snow'
symNames.F = 'Fog'
symNames.M = 'Mist'
symNames.T = 'Risk of Thunder Storms'

const getForecast = ({ lat, lon }) => {
  return Rx.Observable.create(observer => {
    debug('Call url')
    request.get(`http://www.xcweather.co.uk/cgi-bin/fcast/fcast.cgi?lat=${lat}&lon=${lon}&reg=eu`)
      .on('response', (response) => {
        // explicitly treat incoming data as utf8 (avoids issues with multi-byte chars)
        response.setEncoding('utf8')
        let result = ''
        response.on('data', (d) => {
          result += d
        })
        response.on('end', () => {
          // Data reception is done, do whatever with it!
          debug('Processing datas')
          observer.next({ lat, lon, forecasts: process(result) })
          debug('Processing completed')
          observer.complete()
        })
      })
      .on('error', (err) => {
        // handle errors with the request itself
        logger.error('Error with the request:', err.message)
        observer.error(err.message)
      })
  })
}

const process = (datas) => {
  var fcastRun, fcastRunSuffix, fcastStart, fcastCount, fcastInterval, fcast, tzdata
  const fcastKey = 'XXXX'

  // eslint-disable-next-line no-eval
  eval(datas)

  var foreSpeed = []
  var foreDir = []
  var foreSym = []
  var foreTmp = []
  var foreRain = []
  var forePres = []
  var foreCld = []
  var foreVis = []
  var foreGust = []
  var [, encodedFcastValues] = fcast[fcastKey].split('|')

  for (let index = 0; index < fcastCount; index++) {
    let time = fcastStart + (index * fcastInterval)
    foreDir[time] = encodedFcastValues.substr(index * 27, 2)
    foreSpeed[time] = encodedFcastValues.substr(index * 27 + 2, 3)
    foreSym[time] = encodedFcastValues.substr(index * 27 + 5, 2)
    foreTmp[time] = encodedFcastValues.substr(index * 27 + 7, 3)
    foreRain[time] = encodedFcastValues.substr(index * 27 + 10, 4)
    forePres[time] = encodedFcastValues.substr(index * 27 + 14, 4)
    foreCld[time] = encodedFcastValues.substr(index * 27 + 18, 3)
    foreVis[time] = encodedFcastValues.substr(index * 27 + 21, 3)
    foreGust[time] = encodedFcastValues.substr(index * 27 + 24, 3)
  }

  // let tzname = (tzdata['FR'] || tzdata['other']).name
  let tzoffset = (tzdata['FR'] || tzdata['other']).offset
  let tzoffsetmill = tzoffset * 3600000
  const precip2snow = 12

  var result = {}

  for (let index = 0; index < fcastCount; index++) {
    let time = fcastStart + (index * fcastInterval)
    let tmp = moment.unix((time + tzoffsetmill) / 1000)

    if (!result[tmp.utc().format('YYYY-MM-DD')]) {
      result[tmp.utc().format('YYYY-MM-DD')] = {}
    }

    let forecast = {}
    forecast.weatherDescription = sAlt(foreSym[time])
    forecast.winddir = compass[foreDir[time]]
    forecast.windspeed = Math.round(foreSpeed[time] * 1.852)
    forecast.windgust = Math.round(foreGust[time] * 1.852)
    forecast.temp = foreTmp[time] - 273

    let rain = foreRain[time]
    if ('89a'.indexOf(rain.charAt(rain.length - 1)) !== -1) {
      forecast.snow = Math.round(foreRain[index] * precip2snow / 10) / 10 // cm
    } else {
      forecast.precips = foreRain[time] / 10 // mm
    }

    forecast.cloudCoverRate = parseInt(foreCld[time], 10)
    if (parseInt(foreVis[time], 10) !== 999) {
      forecast.visibility = fixed(parseInt(foreVis[time], 10) * 100)
    }
    forecast.pressure = parseInt(forePres[time], 10)

    result[tmp.utc().format('YYYY-MM-DD')][tmp.utc().format('HH:mm')] = forecast
  }
  return result
}

// eslint-disable-next-line no-unused-vars
const fcastReturn = () => {
  // Unused fonction. Needs by evaluation of XCWeather return
}

const sAlt = (a) => {
  const base = ((a.charAt(0) !== 'n') ? 0 : 1)
  return symNames[a.charAt(base)] + symNames[a.charAt(base + 1)]
}

const fixed = (b) => {
  var a
  if (b > 10) {
    a = Math.round(b)
  } else {
    if (b < 1) {
      a = Math.round(b * 100) / 100
    } else {
      a = Math.round(b * 10) / 10
    }
  }
  if (String(a).charAt(0) === '.') {
    return '0' + a
  } else {
    return a
  }
}

module.exports.getForecast = getForecast
