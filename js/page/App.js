/**
 * Created by teiron on 2017/6/12.
 */

import React, {Component} from 'react';
import {Provider} from 'react-redux';
import configureStore from '../store/configureStore'

import Navigation from './Navigation';

const store = configureStore();

export default class App extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Provider store={store}>
                <Navigation />
            </Provider>
        );
    }
}

