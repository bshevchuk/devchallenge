'use strict';

const listAvailableJudges = require('../service/functions/list_available_judges');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

describe('list_available_judges function', () => {
  context("handler", () => {
    it('should be exported', () => {
      expect(listAvailableJudges.handler).to.be.a('function')
    });

    it('should return are errors', async () => {
      const handlerResult = await listAvailableJudges.handler();
      expect(handlerResult.errors).to.be;
    });

    it('should return available judges', async () => {
      const handlerResult = await listAvailableJudges.handler('2018-06-03', '2018-06-04');
      expect(handlerResult).to.be.an('array');
    });
  });

  xcontext('httpHandler', () => {
    it('should export a httpHandler function', () => {
      expect(listAvailableJudges.httpHandler).to.be.a('function')
    });
  });
});