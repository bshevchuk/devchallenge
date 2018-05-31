const faker = require('faker');
const moment = require('moment-timezone');
const db = require('../service/common/db');
const queries = require('../service/common/queries');
const utils = require('../service/common/utils');

const cleanDatabase = async () => {
  await db.query('DELETE FROM judges') // it remove "availabilities" in cascade
};

/**
 *
 * @param count How many judges generate (Default: 5)
 * @param rangesCount How many available ranges create per judge (Default: up to 30)
 * @return {Promise<void>}
 */
const dummyGenerator = async (count = 5, rangesCount = null) => {
  const hrstart = process.hrtime();
  for (let i = 0; i < count; i++) {
    const fakeUsername = utils.transformUsername(faker.internet.userName());

    // we add sequence in prefix because faker can't generate about a million of unique usernames (uniqueness conflict for "username" field)
    const username = `${i}__${fakeUsername}`;

    console.log(i, username);
    const judgeId = await queries.createJudge(username);

    const availabilities = [];
    const rangeCount = rangesCount ? rangesCount : (faker.random.number({ max: 30 }) || 1);
    for (let j = 0; j < rangeCount; j++) {
      const dateMeridian = faker.date.future();
      const startDate = moment(faker.date.between(new Date(), dateMeridian)).seconds(0).milliseconds(0).toISOString();
      const endDate = moment(faker.date.between(dateMeridian, dateMeridian + utils.ONE_YEAR)).seconds(0).milliseconds(0).toISOString();
      availabilities.push({
        start: startDate,
        end: endDate
      })
    }
    // console.log(availabilities);
    await queries.bulkCreateJudgeAvailabilities(judgeId, availabilities)
  }
  const hrend = process.hrtime(hrstart);
  console.log("Execution time (hr): %ds %dms", hrend[0], hrend[1] / 1000000);
};

/**
 *
 * @param date
 * @return {*}
 */
const dateToIso = (date) => {
  return moment(date).tz('UTC').format();
};

module.exports = {
  cleanDatabase,
  dummyGenerator,
  dateToIso
};


