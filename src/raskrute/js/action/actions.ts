
export const ActionTypes = {
  SETTINGS_LOAD: 'SETTINGS_LOAD',
  SETTINGS_SAVE: 'SETTINGS_SAVE',
  SETTINGS_SET: 'SETTINGS_SET',
  RUTE_SEARCH: 'RUTE_SEARCH',
  RUTE_SEARCH_REQUEST: 'RUTE_SEARCH_REQUEST',
  RUTE_SEARCH_FAILURE: 'RUTE_SEARCH_FAILURE',
  RUTE_SEARCH_SUCCESS: 'RUTE_SEARCH_SUCCESS',
  ROUTEID_LOAD_REQUEST: 'ROUTEID_LOAD_REQUEST',
  ROUTEID_LOAD_SUCCESS: 'ROUTEID_LOAD_SUCCESS',
  ROUTEID_LOAD_FAILURE: 'ROUTEID_LOAD_FAILURE',

  FAVORITE_TOGGLE: 'FAVORITE_TOGGLE',
  FAVORITE_LOAD: 'FAVORITE_LOAD',
  JOURNEY_REQUEST: 'JOURNEY_REQUEST',
  JOURNEY_SUCCESS: 'JOURNEY_SUCCESS',
  JOURNEY_FAILURE: 'JOURNEY_FAILURE',
  SET_POSITION: 'SET_POSITION',
  SET_POSITION_FAILURE: 'SET_POSITION_FAILURE',
  TRACK_LOCATION_REQUEST: 'TRACK_LOCATION_REQUEST',
  GET_CLOSEST_REQUEST: 'GET_CLOSEST_REQUEST',
  GET_CLOSEST_SUCCESS: 'GET_CLOSEST_SUCCESS',
  GET_CLOSEST_FAILED: 'GET_CLOSEST_FAILED',
};

export const AppStart = () => {
  return (dispatch: any, getState: any) => {};
};
