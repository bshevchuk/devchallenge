const pg = require('pg');

// without this pg transform "timestamp without time zone" in local timezone
// with this - to UTC+0
pg.types.setTypeParser(1114, function(stringValue) {
  return new Date(stringValue + 'Z')
});

const Pool = pg.Pool;
const process = require('process');

const pool = new Pool({
  // user: process.env.PGUSER,
  // host: process.env.PGHOST,
  // database: process.env.PGDATABASE,
  // password: process.env.PGPASSWORD,
  // port: process.env.PGPORT,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1)
});

module.exports.query = (text, params) => pool.query(text, params);
