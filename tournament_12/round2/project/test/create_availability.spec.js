'use strict';

const helper = require('./_helper');
const queries = require('../service/common/queries');

const sinon = require('sinon');
const stub = sinon.stub();

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;

const fixture1 = require('./fixtures/valid_sample1.json');
const fixture2 = require('./fixtures/valid_sample2.json');

const createAvailability = require('../service/functions/create_availability');

describe('create_availability function', () => {
  context("handler", () => {
    before(async () => {
      await helper.cleanDatabase()
    });

    xit('should be exported', () => {
      expect(createAvailability.handler).to.be.a('function')
    });

    xit('should return are errors', async () => {
      const handlerResult = await createAvailability.handler();
      expect(handlerResult.errors).to.be;
    });

    xit('should successfully import "valid_sample1.json"', async () => {
      const handlerResult = await createAvailability.handler(fixture1);
      expect(handlerResult).to.be.true;
      const user1 = await queries.getJudgeIdByUsername('igor');
      expect(user1).to.not.be.null;
    });

    it('should successfully import "valid_sample2.json"', async () => {
      const handlerResult = await createAvailability.handler(fixture2);
      const user1 = await queries.getJudgeIdByUsername('dmytro');
      expect(user1).to.not.be.null;
      expect(handlerResult).to.be.true;
    });
  });

  context('httpHandler', () => {
    it('should export a httpHandler function', () => {
      expect(createAvailability.httpHandler).to.be.a('function')
    });
  });
});