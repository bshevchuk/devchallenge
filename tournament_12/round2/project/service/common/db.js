const { Pool } = require('pg');
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


// (async () => {
//   const client = await pool.connect()
//   try {
//     const res = await client.query('SELECT * FROM users WHERE id = $1', [1])
//     console.log(res.rows[0])
//   } finally {
//     client.release()
//   }
// })().catch(e => console.log(e.stack))
