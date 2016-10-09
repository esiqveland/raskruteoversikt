import expect from 'expect';

import {utmToLatLong, latLonToUTM, compose, RuteType, filterRuterByType} from '../ruteutils';
import testRuter from './testruter';

describe('utmToLatLong', function() {
  it('should convert utm to lat long', function () {
    const easting = 599400;
    const northing = 6644460;

    const { longitude, latitude } = utmToLatLong(northing, easting);

    // utmToLatLong { longitude: 10.778225707799017, latitude: 59.92559580268342 }

    expect(longitude).toEqual(10.778225707799017);
    expect(latitude).toEqual(59.92559580268342);
  });
  it('should convert lat lon to utm', function () {
    const easting = 599400;
    const northing = 6644460;

    const { longitude, latitude } = utmToLatLong(northing, easting);

    const utm = latLonToUTM(latitude, longitude);

    expect(utm.Y).toEqual(northing);
    expect(utm.X).toEqual(easting);
  });
});

describe('ruteutils', function () {

  describe('filterRuterByType', function () {
    it('filters ruter by type', function () {
      let STOPS = filterRuterByType(testRuter, RuteType.STOP);
      expect(STOPS.length).toEqual(11);
      STOPS.forEach((stop) => {
        expect.assert(stop.PlaceType === RuteType.STOP, 'expected %s to have only routes of type %s', stop.PlaceType, RuteType.STOP);
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