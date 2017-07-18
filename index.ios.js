/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, {Component} from 'react';
import {
    AppRegistry,
} from 'react-native';
import App from './js/page/App.js'

export default class AwesomeComic extends Component {

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <App />
        );
    }
}

AppRegistry.registerComponent('AwesomeComic', () => AwesomeComic);
