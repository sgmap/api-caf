const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const cafRouter = require('./lib/router')
const fs = require('fs')
const config = require('./config.json')

const port = process.env.PORT || config.port || 3000
const app = express()

app.set('json spaces', 2)
app.disable('x-powered-by')

app.use(cors())
app.use(morgan('dev'))

app.use('/api', cafRouter({
  serviceParams: {
    host: config.cafHost,
    cert: fs.readFileSync(config.cafSslCertificate),
    key: fs.readFileSync(config.cafSslKey)
  },
  pingParams: config.cafPingParams
}))

app.use(function notFound (req, res) {
  res.status(404).send({ code: 404, message: `No route for ${req.url}` })
})

if (process.env.NODE_ENV === 'production') {
  app.use(function (err, req, res, next) {
    console.error(err)
    res.status(500).send({
      code: 500,
      message: 'Internal Server Error'
    })
  })
}

app.listen(port, () => {
  console.log('Start listening on port ' + port)
})
