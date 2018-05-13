const config = require('./config');

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const MONGOURI = config.MONGOURI;
const options = {};

let connection = null;

const connectToMongo = function () {
  return mongoose.createConnection(MONGOURI, options);
};
mongoose // http://mongoosejs.com/docs/api.html#connection_Connection
  .connection
  .on("open", function (ref) {
    console.log("[MONGOOSE]", 'Connected open');
  })
  .on("connected", function (ref) {
    console.log("[MONGOOSE]", 'Connected connection');
  })
  .on("disconnected", function (ref) {
    console.log("[MONGOOSE]", 'disconnected connection.');

    setTimeout(function () {
      console.log("[MONGOOSE]", 'reconnecting after delay');
      connection = connectToMongo();
    }, 3000);
  })
  .on("disconnect", function (err) {
    console.log("[MONGOOSE]", 'Error...disconnect', err);
  })
  .on("connecting", function (ref) {
    console.log("[MONGOOSE]", 'connecting.', mongooseReconnectAttempts);
  })
  .on("close", function (ref) {
    console.log("[MONGOOSE]", 'close connection.');
  })
  .on("error", function (err) {
    console.error("[MONGOOSE]", "has connection error ", err); // parse an error reason???
    mongoose.disconnect();
  })
  .on("reconnected", function (ref) {
    console.log("[MONGOOSE]", 'reconnected');
  })
  .on("reconnecting", function (ref) {
    console.log("[MONGOOSE]", 'reconnecting');
  });

connection = connectToMongo();


module.exports.connection = connection;

module.exports.Object = require('./models/objects')(connection);
module.exports.ObjectVersion = require('./models/object_versions')(connection);

