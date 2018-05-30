const db = require('../service/common/db');

const fs = require('fs');
const path = require('path');

const schemaFile = path.resolve(__dirname, '../schema.sql');

const schema = fs.readFileSync(schemaFile, 'UTF-8');

console.log('Begin importing a database schema.');
db.query(schema).then(() => {
  console.log('Schema has been imported to database');
  process.exit(0)
}).catch(err => {
  console.error(err);
  process.exit(-1)
});