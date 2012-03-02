###
A NodeJS server that statically serves javascript out, proxies solr requests,
and handles authentication through the ADS
###

connect = require 'connect'
connectutils = connect.utils
http = require 'http'
querystring = require 'querystring'
url = require 'url'
fs = require 'fs'
# RedisStore = require('connect-redis')(connect)

requests = require "./server/requests"
completeRequest = requests.completeRequest
failedRequest = requests.failedRequest
successfulRequest = requests.successfulRequest
ifLoggedIn = requests.ifLoggedIn
postHandler = requests.postHandler
postHandlerWithJSON = requests.postHandlerWithJSON

proxy = require "./server/proxy"
views = require "./views"


doPost = (func) ->
  (req, res, next) -> postHandler req, res, func

doPostWithJSON = (func) ->
  (req, res, next) -> postHandlerWithJSON req, res, func



# This is just temporary code: could add in a timeout and message

quickRedirect = (newloc) ->
  (req, res, next) ->
    res.writeHead 302, 'Redirect', Location: newloc
    res.statusCode = 302
    res.end()

configureServer = (config, server) ->
  makeADSJSONPCall = (req, res, next) ->
    #jsonpcback = url.parse(req.url, true).query.callback
    jsonpcback = req.query.callback
    console.log "makeADSJSONPCCall: #{jsonpcback}"

    adsoptions =
      host: config.ADSHOST
      path: config.ADSURL
      headers:
        Cookie: "NASA_ADS_ID=#{req.cookies.nasa_ads_id}"

    proxy.doTransformedProxy adsoptions, req, res, (val) ->
      return "#{jsonpcback}(#{val})"

  doADSProxyHandler = (payload, req, res, next) ->
    console.log '>> In doADSProxyHandler'
    console.log ">>    cookies=#{JSON.stringify req.cookies}"
    console.log ">>    payload=#{payload}"

    ifLoggedIn req, res, (loginid) ->
      args = JSON.parse payload
      urlpath = args.urlpath
      console.log ">>   proxying request: #{urlpath}"
      opts =
        host: config.ADSHOST
        port: 80
        path: urlpath
        headers:
          Cookie: "NASA_ADS_ID=#{req.cookies.nasa_ads_id}"

      proxy.doProxy opts, req, res

  doADSProxyHandler2 = (payload, req, res, next) ->
    console.log '>> In doADSProxyHandler2'
    console.log ">>    cookies=#{JSON.stringify req.cookies}"
    console.log ">>    payload=#{payload}"

    args = JSON.parse payload
    console.log "ARGS", args
    urlpath = args.urlpath
    method = args.method ? 'GET'
    #below must be json encoded hash?
    data = args.data
    console.log ">>   proxying request: #{urlpath}"
    poststring=querystring.stringify(data)
    opts =
        host: config.ADSHOST
        port: 80
        method: method
        path: urlpath
        headers: {'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': poststring.length}
    console.log opts
    console.log poststring
    proxy.doProxyPost opts, poststring, req, res


  doADSProxy = doPost doADSProxyHandler
  doADSProxy2 = doPost doADSProxyHandler2

  explorouter = connect(connect.router (app) ->
    app.get '/publications', views.doPublications
    app.get '/saved', views.doSaved
    app.get '/help', views.doHelp
    app.get '/group', views.doGroup
    app.get '/user', views.doUser
    app.get '/objects', quickRedirect 'publications/'
    app.get '/observations', views.doObservations
    app.get '/proposals', quickRedirect 'publications/'
    app.get '/catalogs', quickRedirect 'publications/'
    app.get '/', quickRedirect 'user/'
    )

  #server = connect.createServer()
  #server.use connect.logger()
  #server.use connect.cookieParser()
  #server.use connect.query()

  # Not sure we need to use session middleware, more like login moddleware cookies.
  # Especially since we dont seem to know how not to reextend the time for session cookies.
  # thats prolly right behavior for session cookies since the more people use the more we wanna keep them on
  # server.use(connect.session({ store: new RedisStore, secret: 'keyboard cat', cookie :{maxAge: 31536000000} }));
  #
  server.use config.STATICPREFIX+'/', connect.static(__dirname + '/static/ajax-solr/')
  server.use config.SITEPREFIX+'/explorer/', explorouter
  server.use config.SITEPREFIX+'/adsjsonp', makeADSJSONPCall
  server.use config.SITEPREFIX+'/adsproxy', doADSProxy
  server.use config.SITEPREFIX+'/adsproxy2', doADSProxy2
  server.use '/images', connect.static(__dirname + '/static/ajax-solr/images/')
  server.use '/bootstrap', connect.static(__dirname + '/static/ajax-solr/images/')
  server.use '/backbone', connect.static(__dirname + '/static/ajax-solr/images/')
  console.log "Configured server in astroexplorer-client"

setupServer = (config) ->
  server = connect.createServer()
  server.use connect.logger()
  server.use connect.cookieParser()
  server.use connect.query()
  return server

runServer = (config, server) ->
  console.log "CONFIG", config
  server = setupServer(config)
  configureServer(config, server)
  now = new Date()
  hosturl = "http://localhost:#{config.PORT}#{config.SITEPREFIX}/explorer/publications/"
  console.log "#{now.toUTCString()} - Starting server on #{hosturl}"
  server.listen config.PORT

#migration.validateRedis redis_client, () -> runServer server, 3010
exports.runServer = runServer
exports.setupServer = setupServer
exports.configureServer = configureServer
