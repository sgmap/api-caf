const { Client, ClientError } = require('./client')

function injectClient (clientParams) {
  const client = new Client(clientParams)
  return function (req, res, next) {
    req.client = client
    next()
  }
}

function ping ({ codePostal, numeroAllocataire }) {
  if (!codePostal || !numeroAllocataire) {
    throw new Error('codePostal and numeroAllocataire are required')
  }

  return function (req, res) {
    req.client.getAll(codePostal, numeroAllocataire).then(() => {
      return res.send('pong')
    }).catch((err) => {
      logErrorIfLogger(req, err)
      return res.status(500).send('boom')
    })
  }
}

function fetch () {
  return function (req, res, next) {
    const { codePostal, numeroAllocataire } = req.query
    if (!codePostal || !numeroAllocataire) {
      return res
        .status(400)
        .send({ code: 400, message: 'Les paramètres `codePostal` et `numeroAllocataire` sont obligatoires' })
    }

    req.client.getAll(codePostal, numeroAllocataire)
      .then((data) => {
        return res.send(data)
      })
      .catch((err) => {
        if (err instanceof ClientError) {
          logErrorIfLogger(req, err)
          return res
            .status(err.code)
            .send({ code: err.code, message: err.message })
        } else {
          return next(err)
        }
      })
  }
}

function logErrorIfLogger (req, error) {
  const logger = req.log || req.loggger
  if (logger) {
    logger.error({ error }, error.message)
  }
}

module.exports = { ping, injectClient, fetch }
