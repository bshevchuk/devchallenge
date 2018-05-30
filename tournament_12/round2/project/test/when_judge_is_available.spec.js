'use strict';

const helper = require('./_helper');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const whenJudgeIsAvailable = require('../service/functions/when_judge_is_available');

describe('when_judge_is_available function', () => {
  context("handler", () => {
    before(async () => {
      await helper.cleanDatabase()
    });

    it('should be exported', () => {
      expect(whenJudgeIsAvailable.handler).to.be.a('function')
    });

    it('should return are errors', async () => {
      const handlerResult = await whenJudgeIsAvailable.handler();
      expect(handlerResult.errors).to.be;
    });

    it('should return true', async () => {
      // const handlerResult = await whenJudgeIsAvailable.handler('2018-06-08', '2018-06-10', 'test.judge');
      const handlerResult = await whenJudgeIsAvailable.handler('2018-06-03', '2018-06-04', 'dmytro');
      expect(handlerResult).to.be.an('array');
    });
  })

  context('httpHandler', () => {
    it('should export a httpHandler function', () => {
      expect(whenJudgeIsAvailable.httpHandler).to.be.a('function')
    });
  });
})