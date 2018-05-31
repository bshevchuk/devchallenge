const db = require('./db');

/**
 *
 * @param judgeUsername
 * @returns {Promise<*>}
 */
const getJudgeIdByUsername = async (judgeUsername) => {
  const { rows } = await db.query('SELECT id FROM judges WHERE username = $1 LIMIT 1', [judgeUsername]);
  return rows.length === 0 ? null : parseInt(rows[0].id, 10)
};

/**
 *
 * @param judgeUsername
 * @returns {Promise<*>}
 */
const createJudge = async (judgeUsername) => {
  const { rows } = await db.query('INSERT INTO judges(username) VALUES($1) RETURNING id', [judgeUsername]);
  return rows.length === 0 ? null : parseInt(rows[0].id, 10)
};

/**
 *
 * @param ids
 * @returns {Promise<*>}
 */
const getJudgesUsernamesByIds = async (ids) => {
  const { rows } = await db.query('SELECT username FROM judges WHERE id = ANY($1)', [ids]);
  return rows.map(row => {
    return row.username
  });
};

/**
 *
 * @param dateStart
 * @param dateEnd
 * @returns {Promise<*>}
 */
const getJudgesIdsByAvailableRange = async (dateStart, dateEnd) => {
  // const query = 'SELECT judge_id FROM availabilities WHERE date_start >= $1 AND $2 <= date_end';
  const query = `SELECT judge_id FROM availabilities WHERE (
                  (date_start BETWEEN $1 AND $2) OR (date_end BETWEEN $1 AND $2)
                )`;
  const { rows } = await db.query(query, [dateStart, dateEnd]);
  return rows.map(row => {
    return parseInt(row.judge_id, 10)
  });
};

/**
 *
 * @param judgeId
 * @param dateStart
 * @param dateEnd
 * @returns {Promise<void>}
 */
const getAvailabilitiesByJudgeId = async (judgeId, dateStart, dateEnd) => {
  // const query = 'SELECT date_start, date_end FROM availabilities WHERE judge_id = $1 AND date_start >= $2 AND $3 <= date_end';
  const query = `SELECT date_start, date_end FROM availabilities WHERE judge_id = $1 AND (
                  (date_start BETWEEN $2 AND $3) OR (date_end BETWEEN $2 AND $3)
                )`;
  const { rows } = await db.query(query, [judgeId, dateStart, dateEnd]);
  return rows.map(row => {
    return {
      date_start: row['date_start'],
      date_end: row['date_end']
    }
  })
};

/**
 *
 * @param judgeId
 * @param availabilities
 * @returns {Promise<void>}
 */
const bulkCreateJudgeAvailabilities = async (judgeId, availabilities) => {
  // some transforms for batch insert of availabilities e.g. VALUES ($1, $2, $3), ($4, $5, $6)...
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

/**
 * Exports
 */
module.exports = {
  createJudge,
  getJudgeIdByUsername,
  getJudgesUsernamesByIds,
  getJudgesIdsByAvailableRange,
  getAvailabilitiesByJudgeId,
  bulkCreateJudgeAvailabilities
};