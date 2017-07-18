/**
 * Created by teiron on 2017/6/23.
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
import HTMLView from 'react-native-htmlview'
import Constant from '../util/Constant';
import Toast from 'react-native-root-toast';
import LoadingView from '../loading/LoadingView'

export default class Detail extends Component {

    // static navigationOptions = {
    //     header: {
    //         visible: null,
    //     }
    // }

    constructor(props) {
        super(props);
        this.state = {
            movieInfo: this.props.navigation.state.params.movieInfo,
        };
    }

    componentWillMount() {

    }

    render() {

        return <LoadingView
            onFetch={this._fetch.bind(this)}
        />
    }

    _fetch(callback) {
        DataManager.shareInstance().getMovieDetail(this.state.movieInfo, function (error) {
            if (callback) {
                callback({status: LoadingView.retry, dataView: null})
            }
        }, function (response) {
            if (callback) {
                callback({status: LoadingView.success, dataView: this._renderDataView(response.data)})
            }
        }.bind(this));
    }

    _renderDataView(movieInfo) {
        let copyViews = [];
        for (let i = 0; i < movieInfo.downloadUrls.length; i++) {
            let copyView = (<TouchableHighlight key={i}
                                                style={{flex: 1, backgroundColor: "#ffffff"}}
                                                underlayColor='#c8c7cc'
                                                onPress={() => this._copyDownloadUrl(movieInfo.downloadUrls[i])}>
                <View style={{flex: 1, justifyContent: 'center', margin: 10}}>
                    <Text
                        style={{color: '#007AFF', textAlign: 'center'}}
                        numberOfLines={1}>点击复制迅雷下载链接：{movieInfo.downloadUrls[i]}</Text>
                </View>
            </TouchableHighlight>);
            copyViews.push(copyView);
        }
        let bomttomView = (<View/>);
        if (copyViews.length) {
            if (copyViews.length > 1) {
                bomttomView = (
                    <View style={{flex: 5, backgroundColor: "#ffffff"}}>
                        <ScrollView style={{backgroundColor: "#ffffff"}}>
                            {copyViews}
                        </ScrollView>
                    </View>);
            } else {
                bomttomView = copyViews[0];
            }
        }
        let dataView = (
            <View style={{flex: 1}}>
                <View style={{flex: 15}}>
                    <ScrollView style={{backgroundColor: "#ffffff"}}>
                        <View style={{margin: 10, overflow: 'hidden'}}>
                            <HTMLView style={{}} value={movieInfo.detailHtml}></HTMLView>
                        </View>
                    </ScrollView>
                </View>
                {bomttomView}
            </View>
        );
        return dataView;
    }

    _copyDownloadUrl(downloadUrl) {
        Clipboard.setString(downloadUrl)
        Toast.show('复制迅雷下载地址成功：' + downloadUrl, {
            duration: Toast.durations.LONG,
            position: Toast.positions.CENTER,
            shadow: true,
            animation: true,
            hideOnPress: true,
            delay: 0,

        });
    }
}

