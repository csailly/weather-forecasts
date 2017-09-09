const express = require('express')
const router = express.Router()
const logger = require('utils/logger')('weather:router:routes')
const xcweatherParser = require('api/xcweather.api')
const metofficeParser = require('api/metoffice.api')
const meteoblueParser = require('api/meteoblue.api')

/**
 * @swagger
 * /xcweather/lat/{lat}/lon/{lon}:
 *   get:
 *     description: Retrieve weather forecasts from xcweather for a specific location
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: lat
 *         description: Latitude.
 *         in: path
 *         required: true
 *         type: number
 *       - name: lon
 *         description: Longitude.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: "successful operation"
 */
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

/**
 * @swagger
 * /metoffice/lat/{lat}/lon/{lon}:
 *   get:
 *     description: Retrieve weather forecasts from metoffice for a specific location
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: lat
 *         description: Latitude.
 *         in: path
 *         required: true
 *         type: number
 *       - name: lon
 *         description: Longitude.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: "successful operation"
 */
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

/**
 * @swagger
 * /meteoblue/lat/{lat}/lon/{lon}:
 *   get:
 *     description: Retrieve weather forecasts from Meteoblue for a specific location
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: lat
 *         description: Latitude.
 *         in: path
 *         required: true
 *         type: number
 *       - name: lon
 *         description: Longitude.
 *         in: path
 *         required: true
 *         type: number
 *     responses:
 *       200:
 *         description: "successful operation"
 */
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
