import expect from 'expect';

import {ActionTypes, toggleFavorite, loadFavorites} from '../../action/actions';

import {store, handleFavoritter} from '../store';

describe('store', function () {
  it('should handle undefined initial state', function () {
    expect(() => store.dispatch({type: 'START'})).toNotThrow();
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
        654321: {name: 'Sinsen [T-bane]'}
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
});