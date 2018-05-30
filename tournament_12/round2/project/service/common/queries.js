const db = require('./db');

const getJudgeIdByUsername = async (judgeUsername) => {
  const { rows } = await db.query('SELECT id FROM judges WHERE username = $1 LIMIT 1', [judgeUsername]);
  return rows.length === 0 ? null : parseInt(rows[0].id, 10)
};

const createJudge = async (judgeUsername) => {
  const { rows } = await db.query('INSERT INTO judges(username) VALUES($1) RETURNING id', [judgeUsername]);
  return rows.length === 0 ? null : parseInt(rows[0].id, 10)
};

const bulkCreateJudgeAvailabilities = async (judgeId, availabilities) => {
  // some transforms for batch insert of availabilities
  const flattenValues = availabilities.map(range => {
    return [judgeId, range.start, range.end]
  }).reduce((left, right) => left.concat(right), []);

  const groups = flattenValues.length / 3;
  const queryValues = [];

  let index = 0;
  for (let i = 0; i < groups; i++) {
    queryValues.push(`($${index + 1}, $${index + 2}, $${index + 3})`);
    index = index + 3
  }

  const insert = `INSERT INTO availabilities(judge_id, date_start, date_end) VALUES ${queryValues.join(', ')} ON CONFLICT DO NOTHING`;
  await db.query(insert, flattenValues);
};

module.exports = {
  getJudgeIdByUsername,
  createJudge,
  bulkCreateJudgeAvailabilities
};