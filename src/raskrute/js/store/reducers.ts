import { ActionTypes } from '../action/actions';

type ReduxActionType = typeof ActionTypes
interface ReduxAction {
    type: ReduxActionType;
}

export interface RootState {}
const initialState: RootState = {}
const rootReducer = (state: RootState = initialState, action: ReduxAction) => {
    return {};
};

export default rootReducer;
