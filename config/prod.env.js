'use strict'

require('dotenv').config()

module.exports = {
  NODE_ENV: '"production"',
  GMAPS_API_KEY: `"${process.env.GMAPS_API_KEY}"`
}
