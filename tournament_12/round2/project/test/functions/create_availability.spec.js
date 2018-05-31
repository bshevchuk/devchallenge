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

const fixture1 = require('../_fixtures/valid_sample1.json');
const fixture2 = require('../_fixtures/valid_sample2.json');
const invalidFixture1 = require('../_fixtures/invalid_sample1.json');
const invalidFixture2 = require('../_fixtures/invalid_sample2.json');
const invalidFixture3 = require('../_fixtures/invalid_sample3.json');

const createAvailability = require('../../service/functions/create_availability');

describe('function: #create_availability', () => {
  context("handler", () => {
    before(async () => {
      await testHelper.cleanDatabase()
    });

    it('should be exported', () => {
      expect(createAvailability.handler).to.be.a('function')
    });

    it('should return are errors', async () => {
      const handlerResult = await createAvailability.handler();
      expect(handlerResult.errors).to.be;
    });

    it('should successfully import "valid_sample1.json"', async () => {
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

    it('should return 201 status', async () => {
      const request = {
        body: fixture1
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await createAvailability.httpHandler(req, res);
      expect(res.status).to.be.calledWith(201);
      expect(res.end).to.be.called
    });

    it('should return 400 status where missing "judges" key', async () => {
      const request = {
        body: invalidFixture1
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await createAvailability.httpHandler(req, res);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.called
    });

    it('should return 400 status where missing "start"/"end" key', async () => {
      const request = {
        body: invalidFixture2
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await createAvailability.httpHandler(req, res);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.called
    });

    it('should return 400 status when "start"/"end" have invali date', async () => {
      const request = {
        body: invalidFixture3
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await createAvailability.httpHandler(req, res);
      expect(res.status).to.be.calledWith(400);
      expect(res.send).to.be.called
    });

    it('should return 500 with empty body', async () => {
      const request = {
        body: ''
      };
      const req = mockReq(request);
      const res = mockRes();

      const result = await createAvailability.httpHandler(req, res);
      expect(res.status).to.be.calledWith(500);
      expect(res.send).to.be.called
    });
  });
});