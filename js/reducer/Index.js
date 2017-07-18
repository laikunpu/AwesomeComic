/**
 * Created by teiron on 2017/6/12.
 */
import {combineReducers} from 'redux';
import homeReducer from './MovieReducer';

const rootReducer = combineReducers({
    homeReducer
});

export default rootReducer;