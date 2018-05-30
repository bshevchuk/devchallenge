/**
 * Create availability intervals from example data.
 *
 * Proposed function signature: ​create_availability(input_data_json)
 */

const db = require('../common/db');
const queries = require('../common/queries');
const utils = require('../common/utils');
const exists = utils.exists;

/**
 * Default handler
 *
 * @param input_data_json
 * @returns {Promise<*>}
 */
const handler = async (input_data_json) => {
  let judges;
  try {
    const result = await parseRequestBody(input_data_json);
    if (result.hasOwnProperty('errors')) {
      return { errors: result.errors };
    }
    if (result.judges) {
      judges = result.judges
    }
  } catch (err) {
    return { errors: [err] };
  }

  for (const [judgeUsername, availabilities] of judges.entries()) {
    let judgeId = await queries.getJudgeIdByUsername(judgeUsername);
    if (judgeId === null) {
      judgeId = await queries.createJudge(judgeUsername);
    }

    await queries.bulkCreateJudgeAvailabilities(judgeId, availabilities)
  }
  return true
};

/**
 *
 * @param rawRequest
 * @returns {Promise<*>}
 */
const parseRequestBody = async (rawRequest) => {
  const errors = [];
  if (!exists(rawRequest, 'judges')) {
    errors.push('Missing or invalid "judges" key');
    return { errors: errors };
  }
  let judgesMap = new Map();

  const requestJudges = rawRequest['judges'];
  const usernames = Object.keys(requestJudges);
  usernames.forEach(username => {
    let isValid = true;
    const availabilities = [];
    const available = requestJudges[username]['available'];
    available.forEach(range => {
      if (!exists(range, 'start') || !exists(range, 'end')) {
        isValid = false;
        errors.push(`${username} with missing "start" and/or "end" in range: ${JSON.stringify(range)}`)
      }
      const dateStart = range['start'];
      const dateEnd = range['end'];

      // dirty check of date style
      // is an ISO8601
      const dateStartIsIso = utils.isDateISO(dateStart);
      const dateEndIsIso = utils.isDateISO(dateEnd);
      // is a cron?
      const dateStartIsCron = dateStart.includes('*') || dateStart.includes('?');
      const dateEndIsCron = dateEnd.includes('*') || dateEnd.includes('?');

      if (dateStartIsIso && dateEndIsIso) {
        availabilities.push({
          start: dateStart,
          end: dateEnd
        })
      } else if (dateStartIsCron && dateEndIsCron) {
        const nextStartDate = utils.nextCronDate(dateStart);
        const nextEndDate = utils.nextCronDate(dateEnd);
        const startDates = utils.listCronDates(dateStart);
        const endDates = utils.listCronDates(dateEnd);
      } else {
        errors.push(`${username} have unrecognized format of date in range: ${JSON.stringify(range)}`)
      }
    });

    if (isValid && availabilities.length > 0) {
      judgesMap.set(utils.transformUsername(username), availabilities)
    }
  });

  if (errors.length > 0) {
    return { errors: errors };
  } else {
    return { judges: judgesMap };
  }
};

/**
 * HTTP handler
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
const httpHandler = async (req, res) => {
  try {
    const body = req.body;
    if (!body) {
      return res.status(500).send({ err: 'Empty http body' })
    }
    const result = await handler(body);
    const errors = result.errors;
    if (!errors) {
      res.status(201).end()
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
  httpHandler,
  parseRequestBody
};
