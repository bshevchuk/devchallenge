'use strict';

const utils = require('../service/common/utils');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

describe('utils', () => {
  context('exists', () => {
    it('undefined invalid', () => {
      const obj = undefined;
      expect(utils.exists(obj)).to.be.false;
    });

    it('{"foo": "bar"} have a "foo" property', () => {
      const obj = {"foo": "bar"};
      expect(utils.exists(obj, 'foo')).to.be.true;
    });

    it('{"foobar": "bar"} don\'t have a "foo" property', () => {
      const obj = {"foobar": "bar"};
      expect(utils.exists(obj, 'foo')).to.be.false;
    })
  });

  context('transformUsername', () => {
    it('"myUser.name " must be "myuser.name"', () => {
      const input = 'myUser.name ';
      expect(utils.transformUsername(input)).to.eq('myuser.name')
    })
  });

  // context('isDateISO', () => {
  //   it('"2018-06-03T08:00" should be valid', () => {
  //     const input = '2018-06-03T08:00';
  //     expect(utils.isDateISO((input))).to.be.true;
  //   });
  //
  //   it('"2018-06-03 08:00" should be invalid', () => {
  //     const input = '2018-06-03 08:00';
  //     expect(utils.isDateISO((input))).to.be.false;
  //   });
  // });

  context('listCronDates', () => {
    it('should return an array with future dates', () => {
      const cron = '15 14 1 * *';
      const result = utils.listCronDates(cron);
      expect(result).to.be.an('array');
    });

    it('"15 14 1 * *" ', () => {
      const cron = '15 14 1 * *';
      const result = utils.listCronDates(cron);
      const includes = result.includes("2018-11-01T14:15:00.000Z");
      expect(includes).to.be.true;
    })
  })
});
