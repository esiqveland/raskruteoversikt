import expect from 'expect';

import {compose, RuteType, filterRuterByType} from '../ruteutils';
import testRuter from './testruter';

describe('ruteutils', function () {

  describe('filterRuterByType', function () {
    it('filters ruter by type', function () {
      let STOPS = filterRuterByType(testRuter, RuteType.STOP);
      expect(STOPS.length).toEqual(11);
      STOPS.forEach((stop) => {
        expect.assert(stop.Type === RuteType.STOP, 'expected %s to have only routes of type %s', stop.Type, RuteType.STOP);
      })
    });
  })
});

describe('compose', function () {

  it('should take a function and return a function taking 1 value', function () {
    const fn1 = (value) => {
      value.a += 1;
      return value;
    };

    const composed = compose(fn1);
    const result = [{a: 0}, {a: 0}].map(composed);

    expect(result.length).toEqual(2);
    expect(result[0].a).toEqual(1);
    expect(result[1].a).toEqual(1);
  });

  it('should take a list of functions and return a function taking 1 value', function () {
    const fn1 = (value) => {
      value.a += 1;
      return value;
    };
    const fn2 = (value) => {
      value.a *= 5;
      return value;
    };

    const composed = compose(fn1, fn2);
    const result = [{a: 0}, {a: 0}].map(composed);

    expect(result.length).toEqual(2);
    expect(result[0].a).toEqual(5);
    expect(result[1].a).toEqual(5);
  });
});