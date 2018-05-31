/**
 * Query judge for his availability. ​
 *
 * When Dmytro is free on the 3rd of June
 * (expected response on data above: from 8-9:00AM ).
 *
 * Proposed function signature: ​when_judge_is_available(date_start, date_end, judge_name)
 */

const queries = require('../common/queries');
const utils = require('../common/utils');

/**
 *
 * @param dateStart
 * @param dateEnd
 * @param judgeName
 * @returns {Promise<*>}
 */
const handler = async (dateStart, dateEnd, judgeName) => {
  const judgeUsername = utils.transformUsername(judgeName);
  const judgeId = await queries.getJudgeIdByUsername(judgeUsername);
  if (judgeId === null) {
    return { errors: [`Judge with name "${judgeName}" not found in database`] };
  }
  dateStart = utils.transformDateToGmt(dateStart);
  dateEnd = utils.transformDateToGmt(dateEnd);
  let available = await queries.getAvailabilitiesByJudgeId(judgeId, dateStart, dateEnd)
  available = available.map(record => {
    return {
      date_start: utils.formatDate(record.date_start),
      date_end: utils.formatDate(record.date_end)
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
    const available = result.available;
    const errors = result.errors;
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
