const swaggerJSDoc = require('swagger-jsdoc')
const config = require('config')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

// swagger definition
const swaggerDefinition = {
  info: {
    title: 'weather-forecasts',
    version: '1.0.0',
    description: 'Weather Forecast RESTfull API'
  },
  basePath: config.api.baseUrl
}

// options for the swagger docs
const options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: [path.join(__dirname, '../routes/*.js')]
}

// initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options)

const setup = app => {
  app.use(config.api.baseUrl + '/api-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    res.send(swaggerSpec)
  })
  app.use(
    config.api.baseUrl + '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, true)
  )
}

module.exports = {
  setup
}
