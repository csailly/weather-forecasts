const express = require('express')
const router = express.Router()
const logger = require('utils/logger')('weather:router:routes')
const xcweatherParser = require('api/xcweather.api')
const metofficeParser = require('api/metoffice.api')
const meteoblueParser = require('api/meteoblue.api')

router.get('/xcweather/lat/:lat/lon/:lon', (req, res, next) => {
  xcweatherParser.getForecast({ lat: req.params.lat, lon: req.params.lon })
    .subscribe(
      result => {
        res.json(result)
      },
      error => {
        logger.error(error)
        next(500)
      })
})

router.get('/metoffice/lat/:lat/lon/:lon', (req, res, next) => {
  metofficeParser.getForecast({ lat: req.params.lat, lon: req.params.lon })
    .subscribe(
      result => {
        res.json(result)
      },
      error => {
        logger.error(error)
        next(500)
      })
})

router.get('/meteoblue/lat/:lat/lon/:lon', (req, res, next) => {
  meteoblueParser.getForecast({ lat: req.params.lat, lon: req.params.lon })
    .subscribe(
      result => {
        res.json(result)
      },
      error => {
        logger.error(error)
        next(500)
      })
})

module.exports = router
