import expect from "expect";
import moment from "moment";

import {ActionTypes, AppStart, journeyRequestFailed, toggleFavorite, loadFavorites, journeyRequest, journeyRequestSuccess} from "../../action/actions";

import {JourneyDateTimePattern} from '../../util/Journey';

import {store, handleFavoritter, handleJourneys} from "../store";

describe('store', function () {
  it('should handle undefined initial state', function () {
    expect(() => store.dispatch({type: 'START'})).toNotThrow();
  });
  it('should handle AppStart action', function () {
    expect(() => store.dispatch(AppStart())).toNotThrow();
  });
  describe('handleFavoritter', () => {
    it('should handle undefined state', () => {
      const newState = handleFavoritter(undefined, {type: ActionTypes.ROUTEID_LOAD_FAILURE});
      expect(newState).toBeTruthy();
    });

    it('should handle loading favoritter object', () => {
      const newState = handleFavoritter(undefined, loadFavorites({654321: {name: 'Sinsen [T-bane]'}}));
      expect(newState).toBeTruthy();
      expect(newState).toEqual({654321: {name: 'Sinsen [T-bane]'}})
    });

    it('should handle loading favoritter object with favorites already existing', () => {
      let state = handleFavoritter(undefined, toggleFavorite(123456, 'Majorstuen [T-bane]'));

      const newState = handleFavoritter(state, loadFavorites({654321: {name: 'Sinsen [T-bane]'}}));
      expect(newState).toBeTruthy();
      expect(newState).toEqual({
        123456: {name: 'Majorstuen [T-bane]'},
        654321: {name: 'Sinsen [T-bane]'},
      })
    });

    it('should handle storing and removing favorite', () => {
      let nextState = handleFavoritter(undefined, toggleFavorite(123456, 'Majorstuen [T-bane]'));
      expect(nextState).toBeTruthy();
      expect(nextState).toEqual({123456: {name: 'Majorstuen [T-bane]'}});
      expect(nextState).toEqual({'123456': {name: 'Majorstuen [T-bane]'}});

      nextState = handleFavoritter(nextState, toggleFavorite(123456, 'Majorstuen [T-bane]'));
      expect(nextState).toBeTruthy();
      expect(nextState.hasOwnProperty('123456')).toBeFalsy();
      expect(nextState.hasOwnProperty(123456)).toBeFalsy();
      expect(nextState).toEqual({});
    });
  });

  describe('handleJourneys', () => {
    it('should handle undefined state', () => {
      var timestamp = moment().format(JourneyDateTimePattern);
      const REF = '1234561232';
      const nextState = handleJourneys(undefined, journeyRequest(REF, timestamp));
      expect(nextState.hasOwnProperty(REF)).toEqual(true);
      expect(nextState[REF].isFetching).toEqual(true);
    });

    it('should merge with existing state', () => {
      const startState = {34561232: {isFetching: true, timestamp: moment().add(-1, 'days').format(JourneyDateTimePattern)}};

      var timestamp = moment().format(JourneyDateTimePattern);
      const REF = '1234561232';
      const nextState = handleJourneys(startState, journeyRequest(REF, timestamp));
      expect(nextState).toNotBe(startState);
      expect(nextState.hasOwnProperty(REF)).toEqual(true);
      expect(nextState[REF].isFetching).toEqual(true);
      expect(nextState['34561232'].isFetching).toEqual(true);
      expect(nextState['34561232'].timestamp).toEqual(startState['34561232'].timestamp);
    });

    it('should set error flag on failed request', () => {
      const REF = '1234561232';
      const startState = {[REF]: {isFetching: true, timestamp: moment().add(-1, 'days').format(JourneyDateTimePattern)}};
      const ERROR_MSG = 'En feil har skjedd.';

      const nextState = handleJourneys(startState, journeyRequestFailed(REF, startState[REF].timestamp, ERROR_MSG));
      expect(nextState).toNotBe(startState);
      expect(nextState.hasOwnProperty(REF)).toEqual(true);
      expect(nextState[REF].error).toContain(ERROR_MSG);
      expect(nextState[REF].isFetching).toEqual(false);
    });

    it('should reset error flag on new request', () => {
      const REF = '1234561232';
      const startState = {[REF]: {isFetching: false, error: 'error', timestamp: moment().add(-1, 'days').format(JourneyDateTimePattern)}};

      const nextState = handleJourneys(startState, journeyRequest(REF, startState[REF].timestamp));
      expect(nextState).toNotBe(startState);
      expect(nextState.hasOwnProperty(REF)).toEqual(true);
      expect(nextState[REF].error).toBeFalsy();
    });

    it('should set stops for the given journey on success', () => {
      var timestamp = moment().format(JourneyDateTimePattern);
      const REF = '1234561232';
      let nextState = handleJourneys(undefined, journeyRequest(REF, timestamp));

      const result = [{PlaceType: 'Stop', Name: 'Majorstuen'}, {PlaceType: 'Stop', Name: 'Jernbanetorget'}];
      nextState = handleJourneys(nextState, journeyRequestSuccess(REF, timestamp, result));
      expect(nextState[REF].stops).toEqual(result);
      expect(nextState[REF].isFetching).toEqual(false);
    })
  });
});