const config = require('./config');

const redis = require("redis").createClient({
  url: config.REDISURI,
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.times_connected > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.max(options.attempt * 100, 3000);
  }
})

redis
  .on("error", function (err) {
    console.error("[REDIS] Error ", err);
  })
  .on("reconnecting", function(opts) {
    console.log("[REDIS] reconnecting")
  })
  .on("connect", function() {
    console.log("[REDIS] connect")
  })
  .on("ready", function () {
    console.log("[Redis] is ready / server " + this.address);
  });

module.exports = redis;