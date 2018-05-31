/**
 * List judges that are available within time interval.
 *
 *  List judges which are free
 *  from 00:00 1st June to 00:00 10th of June
 *  (expected response: Dmytro, Ruslan, Igor).
 *
 * Proposed function signature: ​list_available_judges(date_start, date_end).
 */

const queries = require('../common/queries');
const utils = require('../common/utils');

/**
 * Main function
 *
 * @param dateStart
 * @param dateEnd
 * @param tz
 * @returns {Promise<*>}
 */
const handler = async (dateStart, dateEnd, tz = utils.DEFAULT_TIMEZONE) => {
  if (!dateStart || !dateEnd) {
    return { errors: [`Missing "dateStart" and/or "dateEnd"`] };
  }
  dateStart = utils.transformDateToGmt(dateStart, tz);
  dateEnd = utils.transformDateToGmt(dateEnd, tz);
  if (dateStart > dateEnd) {
    return { errors: [`"dateStart" must be lower than "dateEnd"`] };
  }
  const judgeIds = await queries.getJudgesIdsByAvailableRange(dateStart, dateEnd);
  const judges = await queries.getJudgesUsernamesByIds(judgeIds);

  return { judges: judges }
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
    const { tz } = req.query;
    const result = await handler(date_start, date_end, tz);
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

/*ap
 * Exports
 */
module.exports = {
  handler,
  httpHandler
};
