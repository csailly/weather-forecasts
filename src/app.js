// ***IMPORTANT**: The following line should be added to the very 
//                 beginning of your main script! 
require('app-module-path').addPath(__dirname + '/app')

const express = require('express')
const app = express()
const logger = require('utils/logger')()
const router = require('router/routes')
const path = require('path');
const getPort = require('get-port');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json')
  next()
})

const API_ROOT = '/v1/forecasts'
app.use(API_ROOT + '/', router)

// catch 404 and forward to error handler
app.use((req, res, next) => {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.setHeader('Content-Type', 'text/html')
  res.status(err.status || 500);
  res.render('error');
});

getPort({ port: 3000 })
  .then(port => app.listen(port, () => {
    logger.info(`Forecast App listening on port ${port}!`)
  }))

module.exports = app
