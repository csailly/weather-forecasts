const request = require('request')
const Rx = require('rxjs/Rx')
const cheerio = require('cheerio')
const debug = require('debug')('metoffice')
const logger = require('utils/logger')('metoffice')

const getForecast = () => {
  logger.info('IN getForecast')
  return Rx.Observable.create(observer => {
    debug('Call url')
    request.get(`http://www.metoffice.gov.uk/public/weather/forecast/u0fpwk98k`)
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
          observer.next({ forecast: parseBody(result) })
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

const parseBody = (body) => {
  const $ = cheerio.load(body, { ignoreWhitespace: true })

  let forecasts = []
  $('#fcContent > div#weatherViewport > div#weatherWindow > div#weatherHolder > div')
    .filter((i, elem) => $(elem).attr('data-content-id'))
    .each((i, elem) => {
      let date = readDate($, elem)
      let times = readTimes($, elem)
      let descriptions = readWeatherDescriptions($, elem)
      let rainProbabilities = readRainProbabilities($, elem)
      let temps = readTemps($, elem)
      let feelTemps = readFeelTemps($, elem)
      let wind = readWind($, elem)
      let visibility = readVisibility($, elem)
      let humidity = readHumidity($, elem)
      let uv = readUV($, elem)

      forecasts.push({ date, times, descriptions, rainProbabilities, temps, feelTemps, wind, visibility, humidity, uv })
    })

  return forecasts
}

const readDate = ($, elem) => $(elem).attr('data-content-id')

const readTimes = ($, html) => {
  const result = []
  $('tr[class=weatherTime] > td', html)
    .each((i, elem) => {
      result.push($(elem).text())
    })
  return result
}

const readWeatherDescriptions = ($, html) => {
  const result = []
  $('tr[class=weatherWX] > td', html)
    .each((i, elem) => {
      result.push($(elem).attr('title'))
    })
  return result
}

const readRainProbabilities = ($, html) => {
  const result = []
  $('.weatherRain > td', html)
    .each((i, elem) => {
      result.push($(elem).text())
    })
  return result
}

const readTemps = ($, html) => {
  const result = []
  $('.weatherTemp > td', html)
    .each((i, elem) => {
      result.push($('i', elem).attr('data-value-raw'))
    })
  return result
}

const readFeelTemps = ($, html) => {
  const result = []
  $('.weatherFeel > td', html)
    .each((i, elem) => {
      result.push($(elem).attr('data-value-raw'))
    })
  return result
}

const readWind = ($, html) => {
  const result = []
  $('.weatherWind > td', html)
    .each((i, elem) => {
      let direction = $('i', elem).attr('data-value2')
      let speed = $('[data-type=windSpeed]', elem).attr('data-value-raw') // mph
      let gust = $('[data-type=windGust]', elem).attr('data-value-raw') // mph
      result.push({ direction, speed, gust })
    })
  return result
}

const readVisibility = ($, html) => {
  const result = []
  $('.weatherVisibility > td', html)
    .each((i, elem) => {
      result.push($(elem).attr('data-value')) // m
    })
  return result
}

const readHumidity = ($, html) => {
  const result = []
  $('.weatherHumidity > td', html)
    .each((i, elem) => {
      result.push($(elem).text().trim()) // %
    })
  return result
}

const readUV = ($, html) => {
  const result = []
  $('.weatherUV > td', html)
    .each((i, elem) => {
      result.push($('[data-type=uv]', elem).attr('data-value'))
    })
  return result
}

module.exports.getForecast = getForecast
