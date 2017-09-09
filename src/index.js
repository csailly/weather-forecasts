const config = require('config')
const express = require('express')
const app = express()
const routes = require('routes')
const path = require('path')
const helmet = require('helmet')

// Use Helmet to add some security
app.use(helmet())

// swagger setup
require('utils/swagger').setup(app)

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'jade')

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

//Api's routes
app.use(config.api.baseUrl + '/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get('env') === 'development' ? err : {}

  // render the error page
  res.setHeader('Content-Type', 'text/html')
  res.status(err.status || 500)
  res.render('error')
})

module.exports = app
