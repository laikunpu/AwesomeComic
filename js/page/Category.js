/**
 * Created by teiron on 2017/6/30.
 */

import React, {Component} from 'react';
import {
    TouchableWithoutFeedback,
    View,
    Text,
    TouchableHighlight,
    ListView,
} from 'react-native';
import DataManager from '../data/DataManager'
import HTMLView from 'react-native-htmlview'
import Constant from '../util/Constant';
import Toast from 'react-native-root-toast';
import LoadingView from '../loading/LoadingView'
import GridView from 'react-native-easy-gridview';
import Jump from  '../util/Jump'

export default class Category extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataView: null
        };
    }

    componentWillMount() {

    }

    render() {

        return (
            <LoadingView
                onFetch={this._fetch.bind(this)}
            />
        );
    }

    _fetch(callback) {
        DataManager.shareInstance().getAllCategory(function (error) {
            if (callback) {
                callback({status: LoadingView.retry, dataView: null})
            }
        }, function (response) {
            if (callback) {
                callback({status: LoadingView.success, dataView: this._renderDataView(response.data)})
            }
        }.bind(this));
    }

    _renderDataView(categoryInfos) {
        let ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        let dataView = (
            <View style={styles.listContainer}>
                <GridView
                    scrollEnabled={false}
                    dataSource={ds.cloneWithRows(categoryInfos)}
                    renderRow={this._renderRow.bind(this)}
                    numberOfItemsPerRow={3}
                    removeClippedSubviews={false}
                    initialListSize={1}
                    pageSize={categoryInfos.length / 3}
                />
            </View>
        );
        return dataView;
    }

    _renderRow(rowData) {
        return (
            <TouchableHighlight
                underlayColor='#c8c7cc'
                onPress={() => this._onRowPress(rowData)}
            >
                <View style={styles.item}>
                    <Text>{rowData.name}</Text>
                </View>
            </TouchableHighlight>

        )
    }

    _onRowPress(categoryInfo) {
        this._openCategory(categoryInfo);
    }

    _openCategory(categoryInfo) {
        const {navigate} = this.props.navigation;
        Jump.shareInstance().openList(navigate, {categoryInfo: categoryInfo});
    }

}

let styles = {
    listContainer: {flex: 1, backgroundColor: '#ffffff'},
    grid: {},
    item: {
        backgroundColor: '#ffffff',
        margin: 2,
        paddingVertical: 7,
        borderWidth: 1,
        borderColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
        height: 60,
    }
}

