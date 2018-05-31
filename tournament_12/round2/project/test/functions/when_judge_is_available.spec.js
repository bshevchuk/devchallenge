'use strict';

const testHelper = require('../_test_helper');
const utils = require('../../service/common/utils');
const queries = require('../../service/common/queries');

const sinon = require('sinon');
const { mockReq, mockRes } = require('sinon-express-mock');

const chai = require('chai');
const sinonChai = require('sinon-chai');

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

const whenJudgeIsAvailable = require('../../service/functions/when_judge_is_available');

describe('function: #when_judge_is_available', () => {
  context("handler", () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase()
    });

    it('should be exported', () => {
      expect(whenJudgeIsAvailable.handler).to.be.a('function')
    });

    it('should return are errors', async () => {
      const handlerResult = await whenJudgeIsAvailable.handler();
      expect(handlerResult).to.an('object');
      expect(utils.exists(handlerResult, 'errors')).to.be.true;
    });

    it('should return an error if not found judge', async () => {
      const handlerResult = await whenJudgeIsAvailable.handler('2018-06-03', '2018-06-04', 'alice');
      expect(handlerResult).to.be.an('object');
      expect(utils.exists(handlerResult, 'errors')).to.be.true;
      expect(handlerResult.errors[0]).to.eq('Judge with name "alice" not found in database')
    });

    it('should return an error if not found judge', async () => {
      const judge1 = await queries.createJudge('alice');
      const judge2 = await queries.createJudge('bob');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);
      await queries.bulkCreateJudgeAvailabilities(judge2, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const handlerResult = await whenJudgeIsAvailable.handler('2018-06-03', '2018-06-04', 'alice');
      expect(handlerResult).to.be.an('object');
      expect(utils.exists(handlerResult, 'available')).to.be.true;
      expect(handlerResult.available[0].date_start).to.eq('2018-06-03T09:00+03:00'); // in Europe/Kiev timezone
      expect(handlerResult.available[0].date_end).to.eq('2018-06-03T13:00+03:00');
    });
  });

  context('httpHandler', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should export a httpHandler function', () => {
      expect(whenJudgeIsAvailable.httpHandler).to.be.a('function')
    });

    it('should return 200 status', async () => {
      await queries.createJudge('alice');

      const request = {
        params: {
          date_start: '2018-06-03',
          date_end: '2018-06-04',
          judge_name: 'alice'
        }
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await whenJudgeIsAvailable.httpHandler(req, res);
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.called;
    });

    it('should return 400 status', async () => {

      const request = {
        params: {
          date_start: '2018-06-03',
          date_end: '2018-06-04',
          judge_name: 'alice_new'
        }
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await whenJudgeIsAvailable.httpHandler(req, res);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.called;
    });
  });
});