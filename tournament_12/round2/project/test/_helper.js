const db = require('../service/common/db');
const dummyGenerator = require('../scripts/dummy_generator');

const cleanDatabase = async () => {
  await db.query('DELETE FROM judges') // it remove "availabilities" in cascade
};

module.exports = {
  cleanDatabase,
  dummyGenerator
};


