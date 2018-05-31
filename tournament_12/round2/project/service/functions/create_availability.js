/**
 * Create availability intervals from example data.
 *
 * Proposed function signature: ​create_availability(input_data_json)
 */

const moment = require('moment-timezone');

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
        errors.push(`"${username}" with missing "start" and/or "end" in range: ${JSON.stringify(range)}`)
      }
      const dateStart = range['start'];
      const dateEnd = range['end'];

      // is a cron expression?
      const isDateStartCron = dateStart.includes('*') || dateStart.includes('?');
      const isDateEndCron = dateEnd.includes('*') || dateEnd.includes('?');

      if (isDateStartCron && isDateEndCron) {
        const startDates = utils.listCronDates(dateStart);
        const endDates = utils.listCronDates(dateEnd);

        let count = startDates.length <= endDates.length ? startDates.length : endDates.length;
        for (let i = 0; i < count; i++) {
          availabilities.push({
            start: startDates[i],
            end: endDates[i]
          })
        }
      } else {
        // is a date (ISO, Unix epoch timestamp etc)?
        const isDateStartIso = moment(dateStart).isValid();
        const isDateEndIso = moment(utils).isValid();
        if (isDateStartIso && isDateEndIso) {
          availabilities.push({
            start: utils.transforemDateToGmt(dateStart),
            end: utils.transformDateToGmt(dateEnd)
          })
        } else {
          errors.push(`"${username}" have unrecognized format of date in range: ${JSON.stringify(range)}`)
        }
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
