/**
 * Created by teiron on 2017/6/12.
 */

import React, {Component} from 'react';
import {Provider} from 'react-redux';
import configureStore from '../store/configureStore'

import Navigation from './Navigation';
import codePush from 'react-native-code-push'

const store = configureStore();

export default class App extends Component {

    componentDidMount() {
        codePush.sync()
    }

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

