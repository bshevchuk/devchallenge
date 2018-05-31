const moment = require('moment-timezone');
const db = require('./db');
const cronParser = require('cron-parser');

const DEFAULT_TIMEZONE = 'Europe/Kiev';
exports.DEFAULT_TIMEZONE = DEFAULT_TIMEZONE;

const ONE_YEAR = 365 * 24 * 3600 * 1000;
exports.ONE_YEAR = ONE_YEAR;

/**
 *
 * @param object
 * @param property
 * @returns {boolean}
 */
const exists = (object, property = null) => {
  let haveProp = true;
  if (property !== null) {
    haveProp = object.hasOwnProperty(property);
  }
  return typeof(object) !== "undefined" && object !== null && haveProp;
};
exports.exists = exists;

/**
 *
 * @param rawUsername
 * @returns {string}
 */
exports.transformUsername = (rawUsername) => {
  return (rawUsername || '').trim().toLowerCase();
};

/**
 *
 * @param date
 * @param tz
 * @return {Moment}
 */
exports.transformDateToGmt = (date, tz = DEFAULT_TIMEZONE) => {
  return moment.tz(date, tz).utc();
};


/**
 *
 * @param cronExpression
 * @param mineStartDate
 * @returns {Array}
 */
exports.listCronDates = (cronExpression, mineStartDate) => {
  const dates = [];

  const currentDate = mineStartDate ? mineStartDate : new Date();
  const endDate = currentDate.getTime() + ONE_YEAR;
  const options = {
    currentDate,
    endDate,
    iterator: true,
    tz: DEFAULT_TIMEZONE
  };

  try {
    const interval = cronParser.parseExpression(cronExpression, options);

    while (true) {
      try {
        const obj = interval.next();
        dates.push(obj.value.toISOString());
      } catch (err) {
        break;
      }
    }
  } catch (err) {
    console.error(err.message);
  }
  return dates;
};


/**
 *
 * @param date
 * @timezone date
 * @timezone timezone
 * @return {*}
 */
exports.formatDate = (date, timezone = DEFAULT_TIMEZONE) => {
  return moment.tz(date, timezone).format('YYYY-MM-DDTHH:mmZ')
};

