'use strict';

const createAvailability = require('../service/functions/create_availability');

const sinon = require('sinon');
const stub = sinon.stub();

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

const fixture1 = require('./fixtures/valid_sample1');

describe('create_availability function', () => {
  context("handler", () => {
    xit('should be exported', () => {
      expect(createAvailability.handler).to.be.a('function')
    });

    xit('should return are errors', async () => {
      const handlerResult = await createAvailability.handler();
      expect(handlerResult.errors).to.be;
    });

    it('should return true', async () => {
      const handlerResult = await createAvailability.handler(fixture1);
      expect(handlerResult).to.be.true;
    });
  })

  xcontext('httpHandler', () => {
    it('should export a httpHandler function', () => {
      expect(createAvailability.httpHandler).to.be.a('function')
    });
  });
});