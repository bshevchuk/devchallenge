const http = require('http');
// const process = require('process');
const cors = require('cors');
const express = require('express');
const morgan = require("morgan");

const utils = require('./utils');

const config = require('./config');
console.log(`Instance config: ${JSON.stringify(config)}`);

const db = require('./db');
const dbConnection = db.connection;

const app = express();
app.use(morgan('common'));
app.use(cors());

require('./routes')(app);

app.use((req, res, next) => {
  res.status(404);
  res.send("Not found");
});


const server = http.createServer(app);

let connections = {};
server.on('connection', function(conn) {
  const key = conn.remoteAddress + ':' + conn.remotePort;
  connections[key] = conn;
  conn.on('close', function() {
    delete connections[key];
  });
});

server.destroy = function(cb) {
  console.log("Active connections: ", Object.keys(connections).length)
  server.close(cb);
  for (let key in connections) {
    connections[key].destroy();
  }
};

const port = config.PORT;
server.listen(port, async () => {
  console.log(`PID: ${process.pid} PORT: ${port}`);
  const storage = await utils.getFreeSpaceInLocalStorage();
  console.log(`Used ${storage.used} bytes (${utils.bytesToMegabytes(storage.used)}MB) \n Free ${storage.free} bytes (${utils.bytesToMegabytes(storage.free)}MB)`)
});

function shutdown(event) {
  console.log("Graceful Stop", event);

  server.destroy(function onServerClosed(err) {
    if (err) {
      console.error(err);
      process.exit(1)
    } else {
      console.log("Stopping mongo connection");
      dbConnection.close(function () {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0)
      });
    }
  });
}

process.on('SIGTERM', function () {
  shutdown('SIGTERM');
});

process.on('SIGINT', function () {
  shutdown('SIGINT');
});