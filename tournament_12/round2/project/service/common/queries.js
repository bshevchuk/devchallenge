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
 * @param dateStart
 * @param dateEnd
 * @returns {Promise<*>}
 */
const getJudgesIdsAvailables = async (dateStart, dateEnd) => {
  const { rows } = await db.query('SELECT judge_id FROM availabilities WHERE date_start >= $1 AND date_end <= $2', [dateStart, dateEnd]);
  return rows.map(row => {
    return parseInt(row.judge_id, 10)
  });
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
 * @param judgeId
 * @param dateStart
 * @param dateEnd
 * @returns {Promise<void>}
 */
const getAvailabilitiesByJudgeId = async (judgeId, dateStart, dateEnd) => {
  const { rows } = await db.query('SELECT date_start, date_end FROM availabilities WHERE judge_id = $1 AND date_start >= $2 AND date_end <= $3', [judgeId, dateStart, dateEnd]);
  return rows.map(row => {
    return {
      date_start: row['date_start'],
      date_end: row['date_end']
    }
  })
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
  getJudgeIdByUsername,
  getJudgesIdsAvailables,
  getJudgesUsernamesByIds,
  getAvailabilitiesByJudgeId,
  createJudge,
  bulkCreateJudgeAvailabilities
};