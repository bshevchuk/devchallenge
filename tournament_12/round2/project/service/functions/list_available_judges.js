/**
 * List judges that are available within time interval.
 *
 *  List judges which are free
 *  from 00:00 1st June to 00:00 10th of June
 *  (expected response: Dmytro, Ruslan, Igor).
 *
 * Proposed function signature: ​list_available_judges(date_start, date_end).
 */

const db = require('../common/db');
const queries = require('../common/queries');
const utils = require('../common/utils');

/**
 *
 * @param date_start
 * @param date_end
 * @returns {Promise<*>}
 */
const handler = async (date_start, date_end) => {
  if (!date_start || !date_end) {
    return { errors: [`Missing "date_start" and/or "date_end"`] };
  }

  const result = await db.query('SELECT DISTINCT judge_id FROM availabilities WHERE date_start >= $1 AND date_end <= $2', [date_start, date_end])
  const judgeIds = result.rows.map(row => {
    return parseInt(row.judge_id, 10)
  });
  const result2 = await db.query('SELECT username FROM judges WHERE id = ANY($1)', [judgeIds]);
  const judges = result2.rows.map(row => {
    return row.username
  });
  return { ok: true, judges: judges }
};

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const httpHandler = async (req, res) => {
  try {
    const { date_start, date_end } = req.params;
    const result = await handler(date_start, date_end);
    const errors = result.errors;
    const judges = result.judges;
    if (judges) {
      res.status(200).send({ judges })
    } else {
      res.status(400).send({ errors })
    }
  } catch (err) {
    res.status(500).send({ err: 'Unhandled error', details: err.message })
  }
};

/*
 * Exports
 */
module.exports = {
  handler,
  httpHandler
};
