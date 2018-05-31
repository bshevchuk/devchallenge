'use strict';

const utils = require('../../service/common/utils');

const chai = require('chai');
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const assert = chai.assert;

describe('utils', () => {
  context('#exists', () => {
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

  context('#transformUsername', () => {
    it('"myUser.name " must be "myuser.name"', () => {
      const input = 'myUser.name ';
      expect(utils.transformUsername(input)).to.eq('myuser.name')
    })
  });

  context('#transformDateToGmt', () => {
    context('summer date', () => {
      it('"2018-06-03T08:00" will be "2018-06-03T05:00:00Z"', () => {
        const input = '2018-06-03T08:00';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-06-03T05:00:00Z')
      });

      it('"2018-06-03T08:00Z" will be "2018-06-03T08:00:00Z"', () => {
        const input = '2018-06-03T08:00Z';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-06-03T08:00:00Z')
      });

      it('"2018-06-03T08:00+05:00" will be "2018-06-03T03:00:00Z"', () => {
        const input = '2018-06-03T08:00+05:00';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-06-03T03:00:00Z')
      });

      it('"2018-06-03T08:00-08:00" will be "2018-06-03T16:00:00Z"', () => {
        const input = '2018-06-03T08:00-08:00';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-06-03T16:00:00Z')
      });
    });

    context('winter date', () => {
      it('"2018-11-03T08:00" will be "2018-11-03T06:00:00Z"', () => {
        const input = '2018-11-03T08:00';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-11-03T06:00:00Z')
      });

      it('"2018-11-03T08:00Z" will be "2018-11-03T08:00:00Z"', () => {
        const input = '2018-11-03T08:00Z';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-11-03T08:00:00Z')
      });

      it('"2018-11-03T08:00-08:00" will be "2018-06-03T16:00:00Z"', () => {
        const input = '2018-11-03T08:00-08:00';
        const output = utils.transformDateToGmt(input).format();
        expect(output).to.eq('2018-11-03T16:00:00Z')
      });
    })
  });

  context('#listCronDates', () => {
    it('should return an array with future dates', () => {
      const cron = '15 14 1 * *';
      const result = utils.listCronDates(cron);
      expect(result).to.be.an('array');
    });

    it('"15 14 1 * *" ', () => {
      const startDate = new Date(2018, 5, 30, 0, 0, 0);
      const cron = '15 14 1 * *';
      const result = utils.listCronDates(cron, startDate);
      expect(result.includes('2018-07-01T11:15:00.000Z')).to.be.true; // <= summer time (+2)
      expect(result.includes('2018-11-01T12:15:00.000Z')).to.be.true; // <= winter time (+3)
      expect(result.includes('2019-04-01T11:15:00.000Z')).to.be.true; // <= summer time (+2)
    });

    it('"0 8 * * MON-FRI"', () => {
      const startDate = new Date(2018, 5, 30, 0, 0, 0);
      const cron = '0 8 * * MON-FRI';
      const result = utils.listCronDates(cron, startDate);
      expect(result.length).to.eq(260);
      expect(result.includes('2018-07-02T05:00:00.000Z')).to.be.true; // <= summer time (+2)
      expect(result.includes('2018-10-29T06:00:00.000Z')).to.be.true; // <= winter time (+3)
      expect(result.includes('2019-04-01T05:00:00.000Z')).to.be.true; // <= summer time (+2)
    });
  });

  context("#formatDate", () => {
    context('summer date', () => {
      it('"2018-07-02T05:00:00.000Z" in "Europe/Kiev" will be "2018-07-02T08:00"', () => {
        const input = '2018-07-02T05:00:00.000Z';
        const result = utils.formatDate(input, 'Europe/Kiev');
        expect(result).to.eq('2018-07-02T08:00') // +3
      });

      it('"2018-07-02T05:00:00.000Z" in "America/Toronto" will be "2018-07-02T01:00"', () => {
        const input = '2018-07-02T05:00:00.000Z';
        const result = utils.formatDate(input, 'America/Toronto');
        expect(result).to.eq('2018-07-02T01:00') // -4 (in 2018 summer begun Mar 11)
      });
    });

    context('winter date', () => {
      it('"2018-12-02T05:00:00.000Z" in "Europe/Kiev" will be "2018-12-02T07:00" ', () => {
        const input = '2018-12-02T05:00:00.000Z';
        const result = utils.formatDate(input, 'Europe/Kiev');
        expect(result).to.eq('2018-12-02T07:00') // +2
      });

      it('"2018-12-02T05:00:00.000Z" in "America/Toronto" will be "2018-12-02T0:00" ', () => {
        const input = '2018-12-02T05:00:00.000Z';
        const result = utils.formatDate(input, 'America/Toronto');
        expect(result).to.eq('2018-12-02T00:00') // -5 (in 2018 summer ends Nov 4)
      });
    })
  })
});
