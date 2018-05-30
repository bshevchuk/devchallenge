/**
 * Query judge for his availability. ​
 *
 * When Dmytro is free on the 3rd of June
 * (expected response on data above: from 8-9:00AM ).
 *
 * Proposed function signature: ​when_judge_is_available(date_start, date_end, judge_name)
 */

const db = require('../common/db');
const queries = require('../common/queries');
const utils = require('../common/utils');

/**
 *
 * @param date_start
 * @param date_end
 * @param judge_name
 * @returns {Promise<*>}
 */
const handler = async (date_start, date_end, judge_name) => {
  const judgeUsername = utils.transformUsername(judge_name);
  const judgeId = await queries.getJudgeIdByUsername(judgeUsername);
  if (judgeId === null) {
    return { errors: [`Judge with name "${judge_name} not found in database`] };
  }
  const result = await db.query('SELECT * FROM availabilities WHERE judge_id = $1 AND date_start >= $2 AND date_end <= $3', [judgeId, date_start, date_end])
  const available = result.rows.map(row => {
    return {
      date_start: row['date_start'],
      date_end: row['date_end']
    }
  });
  return { available }
};

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const httpHandler = async (req, res) => {
  try {
    const { date_start, date_end, judge_name } = req.params;
    const result = await handler(date_start, date_end, judge_name);
    const errors = result.errors;
    const available = result.available;
    if (available) {
      res.status(200).send({ available })
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
