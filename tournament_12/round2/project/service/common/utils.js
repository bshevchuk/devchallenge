const moment = require('moment-timezone');
const db = require('./db');
const cronParser = require('cron-parser');

const ONE_YEAR = 365 * 24 * 3600 * 1000;
// const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2})\:(\d{2})/; // YYYY-MM-DDTHH:MM

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
 * @param rawString
 * @returns {boolean}
 */
// exports.isDateISO = (rawString) => {
//   return ISO_DATE.test(rawString);
// };

/**
 *
 * @param cronExpression
 * @param params Object: "tz"
 * @returns {Array}
 */
exports.listCronDates = (cronExpression, params = {}) => {
  const dates = [];

  const currentDate = new Date();
  const endDate = currentDate.getTime() + ONE_YEAR;
  const defaultOptions = {
    currentDate,
    endDate,
    iterator: true,
    utc: true,
    // tz: 'Europe/Kiev'
  };
  const options = Object.assign(defaultOptions, params);

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
 * @param cronExpression
 * @returns {*}
 */
exports.nextCronDate = (cronExpression) => {
  let date = null;
  const currentDate = new Date();
  const options = {
    currentDate,
    utc: true,
    // tz: 'Europe/Kiev'
  };
  try {
    const interval = cronParser.parseExpression(cronExpression, options);

    while (true) {
      try {
        const obj = interval.next();
        date = obj.value.toISOString();
        console.log('value:', obj.value.toISOString());
      } catch (err) {
        break;
      }
    }
  } catch (err) {
    console.error(err.message);
  }
  return date;
};

/**
 *
 * @param date
 * @return {*}
 */
exports.formatDate = (date) => {
  return moment(date).format('YYYY-MM-DDTHH:mm')
};

