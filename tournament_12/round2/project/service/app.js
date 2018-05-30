const http = require('http');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const appRoutes = require('./routes');
const seed = require('./common/seed');

const app = express();
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

appRoutes(app);

const server = http.createServer(app);

let connections = {};
server.on('connection', function (conn) {
  const key = conn.remoteAddress + ':' + conn.remotePort;
  connections[key] = conn;
  conn.on('close', function () {
    delete connections[key];
  });
});

server.destroy = function (cb) {
  console.log("Active connections: ", Object.keys(connections).length);
  server.close(cb);
  for (let key in connections) {
    connections[key].destroy();
  }
};

const port = process.env.PORT || 3000;
server.listen(port, async () => {
  console.log(`PID: ${process.pid} PORT: ${port}`);
  seed.importSchema().then(() => {
    console.log('Schema has been imported to database');
  })
});

function shutdown (event) {
  console.log("Graceful Stop", event);

  server.destroy(function onServerClosed (err) {
    if (err) {
      console.error(err);
      process.exit(1)
    } else {
      console.log("Stopping database connection");

      process.exit(0)
    }
  });
}

process.on('SIGTERM', function () {
  shutdown('SIGTERM');
});

process.on('SIGINT', function () {
  shutdown('SIGINT');
});
