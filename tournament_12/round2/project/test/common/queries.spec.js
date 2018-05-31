'use strict';

const testHelper = require('../_test_helper');

const queries = require('../../service/common/queries');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

describe('queries', () => {
  context('#createJudge', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should successfully create record', async () => {
      const judgeId = await queries.getJudgeIdByUsername('alice');
      expect(judgeId).to.be.null;

      const aliceId = await queries.createJudge('alice');
      expect(aliceId).to.be.a('number');

      const judgeId2 = await queries.getJudgeIdByUsername('alice');
      expect(judgeId2).to.be.a('number');

      expect(aliceId).to.eq(judgeId2);
    });
  });

  context('#getJudgeIdByUsername', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should return null if not found', async () => {
      const judgeId = await queries.getJudgeIdByUsername('lorem_ipsum');
      expect(judgeId).to.be.null;
    });

    it('should return a number if found', async () => {
      await queries.createJudge('lorem_ipsum');

      const judgeId = await queries.getJudgeIdByUsername('lorem_ipsum');
      expect(judgeId).to.be.a('number');
    });
  });

  context('#getJudgesUsernamesByIds', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should return a string array ', async () => {
      const aliceId = await queries.createJudge('alice');
      const bobId = await queries.createJudge('bob');

      const result = await queries.getJudgesUsernamesByIds([aliceId, bobId]);
      expect(result).to.be.an('array');
      expect(result.includes('alice')).to.be.true;
      expect(result.includes('bob')).to.be.true;
    })
  });

  context('#getJudgesIdsByAvailableRange', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should return empty array if not found any', async () => {
      const judgeId = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judgeId, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-03T11:00:00Z', '2018-06-03T12:00:00Z')
      expect(result).to.be.an('array');
      expect(result.length).to.eq(0)
    });

    it('should return array with a judge for strict range', async () => {
      const judgeId = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judgeId, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-03T06:00:00Z', '2018-06-03T10:00:00Z');
      expect(result).to.be.an('array');
      expect(result.length).to.eq(1);
      expect(result[0]).to.eq(judgeId);
    });

    it('should return array with a judge when include only start date', async () => {
      const judgeId = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judgeId, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-03T05:00:00Z', '2018-06-03T07:00:00Z');
      expect(result).to.be.an('array');
      expect(result.length).to.eq(1);
      expect(result[0]).to.eq(judgeId);
    });

    it('should return array with judge when include only end date', async () => {
      const judgeId = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judgeId, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-03T09:30:00Z', '2018-06-03T10:30:00Z');
      expect(result).to.be.an('array');
      expect(result.length).to.eq(1);
      expect(result[0]).to.eq(judgeId);
    });

    it('should return array with two judges', async () => {
      const judge1 = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);
      const judge2 = await queries.createJudge('bob');
      await queries.bulkCreateJudgeAvailabilities(judge2, [{
        start: '2018-06-03T08:00:00Z',
        end: '2018-06-03T12:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-03T08:00:00Z', '2018-06-03T10:00:00Z');
      expect(result).to.be.an('array');
      expect(result.length).to.eq(2);
      expect(result.includes(judge1)).to.be.true;
      expect(result.includes(judge2)).to.be.true;
    });

    it('should return array with two judges', async () => {
      const judge1 = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);
      const judge2 = await queries.createJudge('bob');
      await queries.bulkCreateJudgeAvailabilities(judge2, [{
        start: '2018-06-03T08:00:00Z',
        end: '2018-06-03T12:00:00Z'
      }]);

      const result = await queries.getJudgesIdsByAvailableRange('2018-06-01T08:00:00Z', '2018-06-10T23:00:00Z');
      expect(result).to.be.an('array');
      expect(result.length).to.eq(2);
      expect(result.includes(judge1)).to.be.true;
      expect(result.includes(judge2)).to.be.true;
    });
  });

  context('#getAvailabilitiesByJudgeId', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should return empty array if here is no any ranges', async () => {
      const judge1 = await queries.createJudge('alice');

      const result = await queries.getAvailabilitiesByJudgeId(judge1, '2018-06-01T08:00:00Z', '2018-06-10T23:00:00Z')
      expect(result).to.be.an('array');
      expect(result.length).to.eq(0)
    });

    it('should return array with ranges hash', async () => {
      const judge1 = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getAvailabilitiesByJudgeId(judge1, '2018-06-01T08:00:00Z', '2018-06-10T23:00:00Z')
      expect(result).to.be.an('array');
      expect(result.length).to.eq(1);
      expect(result[0].date_start).to.be.an.instanceof(Date);
      expect(result[0].date_end).to.be.an.instanceof(Date);
      expect(testHelper.dateToIso(result[0].date_start)).to.eq('2018-06-03T06:00:00Z');
      expect(testHelper.dateToIso(result[0].date_end)).to.eq('2018-06-03T10:00:00Z');
    })
  });


  context('#bulkCreateJudgeAvailabilities', () => {
    beforeEach(async () => {
      await testHelper.cleanDatabase();
    });

    it('should create one range', async () => {
      const judge1 = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judge1, [{
        start: '2018-06-03T06:00:00Z',
        end: '2018-06-03T10:00:00Z'
      }]);

      const result = await queries.getAvailabilitiesByJudgeId(judge1, '2018-06-01T08:00:00Z', '2018-06-10T23:00:00Z')
      expect(result).to.be.an('array');
      expect(result.length).to.eq(1);
      expect(result[0].date_start).to.be.an.instanceof(Date);
      expect(result[0].date_end).to.be.an.instanceof(Date);
      expect(testHelper.dateToIso(result[0].date_start)).to.eq('2018-06-03T06:00:00Z');
      expect(testHelper.dateToIso(result[0].date_end)).to.eq('2018-06-03T10:00:00Z');
    });

    it('should create two ranges', async () => {
      const judge1 = await queries.createJudge('alice');
      await queries.bulkCreateJudgeAvailabilities(judge1, [
        {
          start: '2018-06-03T06:00:00Z',
          end: '2018-06-03T10:00:00Z'
        },
        {
          start: '2018-06-04T06:00:00Z',
          end: '2018-06-05T10:00:00Z'
        }
      ]);

      const result = await queries.getAvailabilitiesByJudgeId(judge1, '2018-06-01T08:00:00Z', '2018-06-10T23:00:00Z')
      expect(result).to.be.an('array');
      expect(result.length).to.eq(2);
      expect(result[0].date_start).to.be.an.instanceof(Date);
      expect(result[0].date_end).to.be.an.instanceof(Date);
      expect(testHelper.dateToIso(result[0].date_start)).to.eq('2018-06-03T06:00:00Z');
      expect(testHelper.dateToIso(result[0].date_end)).to.eq('2018-06-03T10:00:00Z');

      expect(result[1].date_start).to.be.an.instanceof(Date);
      expect(result[1].date_end).to.be.an.instanceof(Date);
      expect(testHelper.dateToIso(result[1].date_start)).to.eq('2018-06-04T06:00:00Z');
      expect(testHelper.dateToIso(result[1].date_end)).to.eq('2018-06-05T10:00:00Z');
    });
  });
});