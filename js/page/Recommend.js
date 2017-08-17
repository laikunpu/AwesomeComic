/**
 * Created by teiron on 2017/4/28.
 */

'use strict';

import React, {Component, PropTypes} from 'react';
import Swiper from 'react-native-swiper';
import * as types from '../action/ActionType';
import Define from '../define/Define.js';
import DataManager from '../data/DataManager'
import Jump from  '../util/Jump'
import SearchBar from '../view/SearchBar'
import LoadingView from '../loading/LoadingView'

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

export default class Recommend extends Component {
    // static navigationOptions = ({navigation}) => ({
    //     tabBarVisible:navigation.state.params.vi ? false : true
    // })

    constructor(props) {
        super(props);
        this.state = {
            bannerData: [],
            recommendData: [],
            loadStatus: Define.Loading,
            firstRequested: false,
            isRequesting: false,
            isLoadMoreError: false,
            loadMoreCallback: null,
            isFirstRequestSuccess: false,
        };
    }

    componentWillMount() {

    }

    render() {
        let view = <LoadingView
            onFetch={this._onLoadingViewFetch.bind(this)}
        />
        if (this.state.isFirstRequestSuccess) {
            view = <GiftedListView
                rowView={this._renderRowView}
                onFetch={this._onGiftedListViewFetch.bind(this)}
                firstLoader={true}
                pagination={true}
                refreshable={true}
                headerView={this._renderHeaderView.bind(this)}
                customStyles={{
                    paginationView: {
                        backgroundColor: '#eee',
                    },
                }}
                refreshableTintColor="blue"
                paginationFetchingView={this._paginationFetchingView.bind(this)}
                paginationAllLoadedView={this._paginationAllLoadedView.bind(this)}
                paginationWaitingView={this._renderPaginationWaitingView.bind(this)}
                // emptyView={this._renderEmptyView.bind(this)}
                enableEmptySections={true}
                onEndReached={this._onEndReached.bind(this)}
                onEndReachedThreshold={40}
                ref="listView"
                removeClippedSubviews={false}
            />
        }
        return (
            <View style={{flex: 1, backgroundColor: "#ffffff", flexDirection:'column-reverse'}}>
                {view}
                <SearchBar
                    navigation={this.props.navigation}
                />
            </View>
        );
    }

    _onLoadingViewFetch(callback) {
        this._fetchFirstData(function (error, response) {
            if (!error) {
                this.setState(previousState => {
                    previousState.bannerData = response.bannerData;
                    previousState.recommendData = response.recommendData;
                    previousState.isFirstRequestSuccess = true;
                    return previousState;
                });
            } else {
                callback({status: LoadingView.retry, dataView: null})
            }
        }.bind(this))
    }

    _fetchFirstData(callback) {
        let requestCompleteCount = 0;
        let requestError;
        let bannerData;
        let recommendData;
        let loadStatus;
        let completeFunc = function () {
            requestCompleteCount++;
            if (requestCompleteCount == 2) {
                let response = {};
                response.bannerData = bannerData;
                response.recommendData = recommendData;
                if (callback) {
                    callback(requestError, response);
                }
            }
        }.bind(this);
        DataManager.shareInstance().getBannerList(function (error) {
            requestError = error;
            completeFunc();
        }, function (response) {
            bannerData = response.data;
            completeFunc();
        }.bind(this))
        DataManager.shareInstance().getRecommendList(1, function (error) {
            requestError = error;
            completeFunc();
        }, function (response) {
            recommendData = response.data;
            completeFunc();
        }.bind(this))
    }

    _fetchPageData(page, callback) {
        DataManager.shareInstance().getRecommendList(page, function (error) {
            callback(error, null);
        }.bind(this), function (response) {
            callback(null, response);
        }.bind(this))
    }

    /**
     * Will be called when refreshing
     * Should be replaced by your own logic
     * @param {number} page Requested page to fetch
     * @param {function} callback Should pass the rows
     * @param {object} options Inform if first load
     */
    _onGiftedListViewFetch(page = 1, callback, options) {
        if (!this.state.isRequesting) {
            this.state.isRequesting = true;
            let rows = [];
            let callbackOptions = {};
            if (page == 1) {
                let completeFunc = function () {
                    for (let i = 0; i < this.state.recommendData.length; i++) {
                        let movieInfo = this.state.recommendData[i];
                        let rowView = this._renderMovieRowView(movieInfo);
                        rows.push(rowView);
                    }
                    callback(rows, callbackOptions);
                    this.state.isRequesting = false;
                }.bind(this);
                if (options.firstLoad) {
                    completeFunc();
                } else {
                    this._fetchFirstData(function (error, response) {
                        if (!error) {
                            this.state.bannerData = response.bannerData;
                            this.state.recommendData = response.recommendData;
                            completeFunc();
                        }
                    }.bind(this))
                }
            } else {
                this._fetchPageData(page, function (error, response) {
                    if (!error) {
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
                    }else {
                        this.state.isLoadMoreError = true;
                        this.state.isRequesting = false;
                        callback(rows, callbackOptions);
                        this.refs.listView._setPage(page - 1);
                    }
                }.bind(this))
            }
        }
        console.log("page = " + page);
    }

    _onEndReached() {
        if (!this.state.isRequesting && !this.state.isLoadMoreError) {
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

    _renderHeaderView() {
        var that = this;
        // 图片列表
        let bannerViews = this.state.bannerData.map((value, i) => {
            return (
                <TouchableWithoutFeedback key={i} onPress={() => that._openDetail(value)}>
                    <Image key={i} style={{flex: 1, justifyContent: 'flex-end'}} source={{uri: value.bannerUrl}}>
                        <View style={{
                            width: screenWidth,
                            height: 25,
                            justifyContent: 'center',
                            backgroundColor: '#000000',
                            opacity: 0.6
                        }}>
                            <Text style={{color: '#ffffff', left: 10, width: screenWidth - 20}}
                                  numberOfLines={1}>{value.name}</Text>
                        </View>
                    </Image>
                </TouchableWithoutFeedback>
            )
        });
        let bannerRowView = (<View/>);
        if (bannerViews && bannerViews.length) {
            bannerRowView = (
                <View>
                    <Swiper style={{}} height={200} width={screenWidth} autoplay={true} autoplayTimeout={5}>
                        {bannerViews}
                    </Swiper>
                </View>
            );
        }
        return bannerRowView;
    }

    _paginationFetchingView() {
        return (<View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}><Text>加载中...</Text></View>);
    }

    _paginationAllLoadedView() {
        return (<View style={{height: 50, alignItems: 'center', justifyContent: 'center'}}><Text>全部加载完成</Text></View>);
    }

    _renderPaginationWaitingView(paginateCallback) {
        if (this.state.isLoadMoreError) {
            this.state.loadMoreCallback = paginateCallback;
            return (
                <TouchableHighlight
                    underlayColor='#c8c7cc'
                    onPress={this._onloadMore.bind(this)}
                    style={{height: 50, alignItems: 'center', justifyContent: 'center'}}
                >
                    <Text style={{}}>
                        加载更多
                    </Text>
                </TouchableHighlight>
            );
        }
    }

    _onloadMore() {
        this.state.isLoadMoreError = false;
        this.state.loadMoreCallback();
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