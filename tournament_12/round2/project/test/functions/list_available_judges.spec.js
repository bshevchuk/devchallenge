'use strict';

const testHelper = require('../_test_helper');
const queries = require('../../service/common/queries');

const sinon = require('sinon');
const { mockReq, mockRes } = require('sinon-express-mock');

const chai = require('chai');
const sinonChai = require('sinon-chai');

const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
chai.use(sinonChai);
const expect = chai.expect;

const listAvailableJudges = require('../../service/functions/list_available_judges');

describe('function: #list_available_judges', () => {
  context("handler", () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should be exported', () => {
      expect(listAvailableJudges.handler).to.be.a('function')
    });

    it('should return are errors', async () => {
      const handlerResult = await listAvailableJudges.handler();
      expect(handlerResult.errors).to.be;
    });

    it('should return available judges', async () => {
      const judge1 = await queries.createJudge('alice');
      // const judge2 = await queries.createJudge('bob');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const handlerResult = await listAvailableJudges.handler('2018-06-03', '2018-06-04');
      expect(handlerResult.judges).to.be.an('array');
      expect(handlerResult.judges[0]).to.eq('alice')
    });
  });

  context('httpHandler', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should export a httpHandler function', () => {
      expect(listAvailableJudges.httpHandler).to.be.a('function')
    });

    it('should return 200 status', async () => {
      await queries.createJudge('alice');

      const request = {
        params: {
          date_start: '2018-06-03',
          date_end: '2018-06-04',
        }
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await listAvailableJudges.httpHandler(req, res);
      expect(res.status).to.be.calledWith(200);
      expect(res.send).to.be.called;
    });

    it('should return 400 status', async () => {

      const request = {
        params: {
          date_start: '2019-06-03',
          date_end: '2018-06-04',
        }
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await listAvailableJudges.httpHandler(req, res);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.called;
    });
  });
});