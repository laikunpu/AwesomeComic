/**
 * Created by teiron on 2017/7/4.
 */

'use strict';

import React, {Component, PropTypes} from 'react';
import Swiper from 'react-native-swiper';
import * as types from '../action/ActionType';
import Define from '../define/Define.js';
import DataManager from '../data/DataManager'
import Jump from  '../util/Jump'

var GiftedListView = require('react-native-gifted-listview');

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
} from 'react-native';

/**
 * 触发Action
 */

import {getBannerList, bannerLoading, getRecommendList} from '../action/MovieAction';

/**
 * 用于将UI和Reducer绑定
 */
import {connect} from 'react-redux';

import Dimensions from 'Dimensions';

// 屏幕宽度
let screenWidth = Dimensions.get('window').width;
let screenHeight = Dimensions.get('window').height;

export default class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            recommendData: [],
            loadStatus: Define.Loading,
            firstRequested: false,
            isRequesting: false,
            keyword: this.props.keyword,
        };
    }

    componentWillMount() {

    }

    render() {
        let renderView = <View />
        if (this.props.keyword) {
            renderView = <GiftedListView
                rowView={this._renderRowView}
                onFetch={this._onFetch.bind(this)}
                firstLoader={true}
                pagination={true}
                refreshable={true}
                customStyles={{
                    paginationView: {
                        backgroundColor: '#eee',
                    },
                }}
                refreshableTintColor="blue"
                paginationFetchingView={this._paginationFetchingView.bind(this)}
                paginationAllLoadedView={this._paginationAllLoadedView.bind(this)}
                paginationWaitingView={this._renderPaginationWaitingView.bind(this)}
                emptyView={this._renderEmptyView.bind(this)}
                enableEmptySections={true}
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={40}
                ref="listView"
                removeClippedSubviews={false}
            />
        }
        return (
            <View style={this.props.style}>
                <View style={{flex: 1, backgroundColor: "#ffffff"}}>
                    {renderView}
                </View>
            </View>
        );
    }

    /**
     * Will be called when refreshing
     * Should be replaced by your own logic
     * @param {number} page Requested page to fetch
     * @param {function} callback Should pass the rows
     * @param {object} options Inform if first load
     */
    _onFetch(page = 1, callback, options) {
        if (!this.state.isRequesting) {
            this.state.isRequesting = true;
            let rows = [];
            let callbackOptions = {};
            if (options && options.firstLoad) {
                this.state.isRequesting = false;
                callback(rows, callbackOptions);
            } else {
                if (page == 1) {
                    let requestCompleteCount = 0;
                    let requestError;
                    let completeFunc = function () {
                        requestCompleteCount++;
                        if (requestCompleteCount == 1) {
                            if (requestError) {
                                this.state.loadStatus = Define.LoadRetry;
                                for (let i = 0; i < this.state.recommendData.length; i++) {
                                    let movieInfo = this.state.recommendData[i];
                                    let rowView = this._renderMovieRowView(movieInfo);
                                    rows.push(rowView);
                                }
                            } else {
                                this.state.loadStatus = Define.LoadSuccess;
                            }
                            callback(rows, callbackOptions);
                            this.state.isRequesting = false;
                        }
                    }.bind(this);

                    DataManager.shareInstance().getSearchList(this.state.keyword, page, function (error) {
                        requestError = error;
                        completeFunc();
                    }, function (response) {
                        this.state.recommendData = [];
                        for (let i = 0; i < response.data.length; i++) {
                            let movieInfo = response.data[i];
                            let rowView = this._renderMovieRowView(movieInfo);
                            rows.push(rowView);
                            this.state.recommendData.push(movieInfo);
                        }
                        if (page >= response.userInfo.maxPage) {
                            callbackOptions.allLoaded = true;
                        }
                        completeFunc();
                    }.bind(this))
                } else {
                    DataManager.shareInstance().getSearchList(this.state.keyword, page, function (error) {
                        callback(rows, callbackOptions);
                        this.state.isRequesting = false;
                    }, function (response) {
                        for (let i = 0; i < response.data.length; i++) {
                            let movieInfo = response.data[i];
                            let rowView = this._renderMovieRowView(movieInfo);
                            rows.push(rowView);
                            this.state.recommendData.push(movieInfo);
                        }
                        if (page >= response.userInfo.maxPage) {
                            callbackOptions.allLoaded = true;
                        }
                        callback(rows, callbackOptions);
                        this.state.isRequesting = false;
                    }.bind(this))
                }
            }
            console.log("page = " + page);
        }
    }

    _onEndReached() {
        if (!this.state.isRequesting) {
            this.refs.listView._onPaginate()
        }
    }

    /**
     * When a row is touched
     * @param {object} rowData Row data
     */
    _onRowPress(movieInfo) {
        console.log(movieInfo.name + ' pressed');
        this._openDetail(movieInfo);
    }

    _renderEmptyView(refreshCallback) {
        if (this.state.loadStatus == Define.LoadRetry) {
            return (<View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                height: screenHeight - 49
            }}>
                <Text>
                    加载失败，下拉可刷新！
                </Text>
            </View>);
        } else {
            if (!this.state.firstRequested) {
                this.state.firstRequested = true;
                setTimeout(() => {
                    refreshCallback();
                }, 100);

            }
        }
    }

    _paginationFetchingView() {
        return (<View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}><Text>加载中...</Text></View>);
    }

    _paginationAllLoadedView() {
        return (<View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}><Text>全部加载完成</Text></View>);
    }

    _renderPaginationWaitingView(paginateCallback) {
        // return (
        //     <TouchableHighlight
        //         underlayColor='#c8c7cc'
        //         onPress={paginateCallback}
        //         style={{height: 50, alignItems: 'center', justifyContent: 'center'}}
        //     >
        //         <Text style={{}}>
        //             加载更多
        //         </Text>
        //     </TouchableHighlight>
        // );
    }

    _renderMovieRowView(movieInfo) {
        return (
            <TouchableHighlight
                underlayColor='#c8c7cc'
                onPress={() => this._onRowPress(movieInfo)}
            >
                <View style={{height: 60}}>
                    <View style={{left: 10, width: screenWidth - 20, height: 59, justifyContent: 'space-around'}}>
                        <Text numberOfLines={1}>{movieInfo.name}</Text>
                        <Text style={{color: '#929292'}} numberOfLines={1}>{movieInfo.date}</Text>
                    </View>
                    <View style={{height: 1, width: screenWidth, backgroundColor: "#f5f5f5"}}/>
                </View>
            </TouchableHighlight>
        );
    }

    /**
     * Render a row
     * @param {object} rowData Row data
     */
    _renderRowView(rowData) {
        if (!rowData) {
            rowData = (<View/>);
        }
        return rowData;
    }

    _openDetail(movieInfo) {
        const {navigate} = this.props.navigation;
        Jump.shareInstance().openDetail(navigate, {movieInfo: movieInfo});
    }

}


// function mapStateToProps(state) {
//     const {homeReducer} = state;
//     return {
//         homeReducer
//     }
// }
//
// export default connect(mapStateToProps)(Home);