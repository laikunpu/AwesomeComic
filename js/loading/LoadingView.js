/**
 * Created by teiron on 2017/6/29.
 */

import React, {Component, PropTypes} from 'react';
import {
    TouchableWithoutFeedback,
    View,
    Text,
    ActivityIndicator,
} from 'react-native';


export default class LoadingView extends Component {

    static loading = 0
    static retry = 1
    static success = 2
    static empty = 3

    static defaultProps = {
        onFetch: null,
        dataView: null,
    }
    static propTypes = {
        onFetch: React.PropTypes.func,
        dataView: React.PropTypes.object,
    }

    constructor(props) {
        super(props);
        this.state = {
            status: LoadingView.loading,
            dataView: this.dataView,
        };
    }

    componentWillMount() {
        this._fetch();
    }

    render() {
        if (this.state.status == LoadingView.retry) {
            return this._renderErrorView();
        } else if (this.state.status == LoadingView.success) {
            let view = (<View/>)
            if (this.state.dataView) {
                view = this.state.dataView;
            }
            return view;
        } else if (this.state.status == LoadingView.empty) {
            return this._renderEmptyView();
        } else {
            return this._renderLoadingView();
        }
    }

    //加载等待的view
    _renderLoadingView() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ffffff',
            }}>
                <ActivityIndicator
                    animating={true}
                    style={{height: 80}}
                    color='blue'
                    size="large"
                />
            </View>
        );
    }

    //加载失败view
    _renderErrorView() {
        return (
            <TouchableWithoutFeedback onPress={this._retry.bind(this)}>
                <View style={{
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                }}>
                    <Text>
                        加载失败，请点击重试！
                    </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    //加载失败view
    _renderEmptyView() {
        return (
            <View style={{
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#ffffff',
            }}>
                <Text>
                    数据为空！
                </Text>
            </View>
        );
    }

    _retry() {
        this.setState(previousState => {
            return {status: LoadingView.loading};
        });
        this._fetch();
    }

    _fetch() {
        if (this.props.onFetch) {
            this.props.onFetch(this._callBack.bind(this));
        }
    }

    _callBack(options) {
        if (options) {
            if (options.status) {
                this.setState(previousState => {
                    return {status: options.status, dataView: options.dataView};
                });
            }
        }
    }

}