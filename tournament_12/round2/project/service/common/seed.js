const db = require('../common/db');
const queries = require('../common/queries');
const utils = require('../common/utils');
const fs = require('fs');
const path = require('path');
const faker = require('faker');

const schemaFile = path.resolve(__dirname, '../../schema.sql');

module.exports.importSchema = async () => {
  const schema = fs.readFileSync(schemaFile, 'UTF-8');
  await db.query(schema);
};

// module.exports.generate = async (count = 5) => {
//   for (let i = 0; i < count; i++) {
//     const username = utils.transformUsername(faker.internet.userName());
//     const judgeId = await queries.createJudge(username);
//
//     const date1 = faker.date.future();
//   }
// };
