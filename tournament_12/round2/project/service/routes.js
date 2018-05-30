const Router = require('express-promise-router');
const router = new Router();

const createAvailability = require('./functions/create_availability').httpHandler;
const listAvailableJudges = require('./functions/list_available_judges').httpHandler;
const whenJudgeIsAvailable = require('./functions/when_judge_is_available').httpHandler;

/**
 * body with valid json
 */
router.post('/create', createAvailability);

/**
 * query params:
 * `date_start` - ISO8601 date format
 * `date_end` - ISO8601 date format
 * `judge_name` - judge name
 */
// router.get('/judge_availabilities', whenJudgeIsAvailable);
router.get('/fetch/:date_start/:date_end/:judge_name', whenJudgeIsAvailable);

/**
 * query params:
 * `date_start` - ISO8601 date format
 * `date_end` - ISO8601 date format
 */
// router.get('/list_availabilities', listAvailableJudges);
router.get('/fetch/:date_start/:date_end', listAvailableJudges);


module.exports = (app) => {
  app.use(router);
  app.use((req, res, next) => {
    res.status(404);
    res.send("Not found route");
  });
};