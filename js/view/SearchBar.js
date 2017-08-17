/**
 * Created by teiron on 2017/7/3.
 */

import React, {Component} from 'react';
import {
    TouchableWithoutFeedback,
    ScrollView,
    Animated,
    View,
    Text,
    StyleSheet,
    Image,
    ActivityIndicator,
    TouchableHighlight,
    RefreshControl,
    Clipboard,
} from 'react-native';
import DataManager from '../data/DataManager'
import Constant from '../util/Constant';
import Toast from 'react-native-root-toast';
import LoadingView from '../loading/LoadingView'
import SearchBox from 'react-native-search-box';
import SearchView from '../page/Search'

export default class SearchBar extends Component {

    // static defaultProps = {
    //     searchView: <View/>,
    //     normalView: <View/>,
    // }
    // static propTypes = {
    //     searchView: React.PropTypes.object,
    //     normalView: React.PropTypes.object,
    // }

    constructor(props) {
        super(props);
        this.state = {
            showSearchView: false,
        };
    }

    componentWillMount() {

    }

    render() {
        let searchView = <View/>;
        if (this.state.showSearchView) {
            searchView =
                <SearchView
                    style={{top: 20, height: Constant.SCREEN_HEIGHT - 64}}
                    keyword={this.state.keyword}
                    navigation={this.props.navigation}
                />
        }
        return (
            <View style={{height: 64}}>
                <View style={{top: 20, height: 44}}>
                    <View style={{height: 43}}>
                        <SearchBox
                            ref="search_box"
                            backgroundColor="#ffffff"
                            titleCancelColor="#999999"
                            placeholder="搜索"
                            cancelTitle="取消"
                            onFocus={this._onFocus.bind(this)}
                            onCancel={this._onCancel.bind(this)}
                            onSearch={this._onSearch.bind(this)}
                        />
                    </View>
                    <View style={{height: 1, backgroundColor: "#f5f5f5"}}/>
                </View>
                {searchView}
            </View>
        );
    }

    _onFocus = (text) => {
        return new Promise(function (resolve, reject) {
            this.setState({
                showSearchView: true,
                keyword: null,
            });
            this.props.navigation.setParams({hideTabbar: true});
            resolve();
        }.bind(this));
    }

    _onCancel = (text) => {
        return new Promise(function (resolve, reject) {
            this.setState({
                showSearchView: false
            });
            this.props.navigation.setParams({hideTabbar: false});
            resolve();
        }.bind(this));
    }

    _onSearch(text) {
        return new Promise(function (resolve, reject) {
            if (text) {
                this.setState({
                    showSearchView: true,
                    keyword: text,
                });
                // DataManager.shareInstance().getSearchList(text, 1, null, null);
            }
            resolve();
        }.bind(this));
    }

}

