config = require('./config').config
migration = require('./myads/migration') 
redis = require 'redis'
redis_client = redis.createClient()
clientserver = require('./server2')
serverserver = require('./server/server')
myadsserver = require('./myads/server-myads')


startServer = (config, server) ->
  console.log "CONFIG", config
  now = new Date()
  hosturl = "http://localhost:#{config.PORT}#{config.SITEPREFIX}/explorer/publications/"
  console.log "#{now.toUTCString()} - Starting server on #{hosturl}"
  server.listen config.PORT

server = clientserver.setupServer(config)
serverserver.configureServer(config, server)
myadsserver.configureServer(config, server)
clientserver.configureServer(config, server)

migration.validateRedis redis_client, () -> startServer config, server