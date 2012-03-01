#ASTROEXPLORER CLIENT CONFIG
_ = require 'underscore'
configserver = require './server/config'
configmyads = require './myads/config'

sp = '/semantic2/alpha'
config={}
_.extend config, configserver.config
_.extend config, configmyads.config

configlocal =
  SITEPREFIX: sp
  STATICPREFIX: "#{sp}/static"
  TEMPLATEDIR: __dirname + '/static/ajax-solr/templates/'

_.extend config, configlocal

exports.config = config
