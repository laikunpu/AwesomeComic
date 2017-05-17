/**
 * Created by teiron on 2017/4/28.
 */

'use strict';

import React, {Component, PropTypes} from 'react';

import {
    TouchableWithoutFeedback,
    ScrollView,
    Animated,
    View,
} from 'react-native';

import Dimensions from 'Dimensions';

// 屏幕宽度
var screenWidth = Dimensions.get('window').width;

export default class FocusImageView extends Component{
    constructor(props) {
        super(props);
        this.state = {
            images : ['#dfe24a','#68eaf9','#ef9af9'],// 使用颜色代替图片
            selectedImageIndex: 0,
            isNeedRun: true,
        };

        this._index = 0;// 当前正在显示的图片
        this._max = this.state.images.length;// 图片总数
        this._startX = 0;
        this._endX = 0;

    }

    render(){

        // 图片列表
        let images = this.state.images.map((value,i) => {
            return (
                <TouchableWithoutFeedback onPress={()=>this._showToast(i)}>
                    <View style={{width:screenWidth,height:130,backgroundColor:value}}/>
                </TouchableWithoutFeedback>);
        });

        // 小圆点指示器
        let circles = this.state.images.map((value,i) => {
            return (<View key={i} style={ (i == this.state.selectedImageIndex) ? styles.circleSelected : styles.circle}/>);
        });

        // 小圆点位置居中显示
        let imageLength = this.state.images.length;
        let circleLength = 6 * imageLength + 5 * 2 * imageLength;
        let center = (screenWidth - circleLength) / 2;

        return (
            <View style={styles.container}>
                <ScrollView horizontal={true}
                            scrollEventThrottle={16}
                            showsHorizontalScrollIndicator={false}
                            showsVerticalScrollIndicator={false}
                            onTouchStart={(evt)=>this._onTouchStart(evt)}
                            onTouchMove={(evt)=>{console.log(evt.nativeEvent.locationX + " " + evt.nativeEvent.locationY);}}
                            onTouchEnd={(evt)=>this._onTouchEnd(evt)}
                            onScroll={()=>this._onScroll()}
                            ref={(scrollView) => {
                                this._scrollView = scrollView;
                            }}
                            // onStartShouldSetResponder={(evt)=>{true}}
                            // onMoveShouldSetResponder={(evt)=>true}
                            // onResponderMove={(evt)=>{console.log(evt.nativeEvent.locationX + " " + evt.nativeEvent.locationY);}}
                            // onResponderRelease={(evt)=>{console.log(evt.nativeEvent.locationX + " " + evt.nativeEvent.locationY);}}
                >

                    <Animated.View style={{flexDirection:'row'}}>{images}</Animated.View>
                </ScrollView>
                <View style={{flexDirection:'row',position:'absolute',top:115,left:center}}>{circles}</View>
            </View>
        );
    }

    _onTouchStart(evt){
        this._startX = evt.nativeEvent.locationX;
        // 当手指按到scrollview时停止定时任务
        clearInterval(this._timer);
    }

    _onTouchEnd(evt){
        this._endX = evt.nativeEvent.locationX;
        let index = this._index;
        if (this._endX > this._startX) {
            index--;
        }else if (this._endX == this._startX) {

        }else if (this._endX < this._startX) {
            index++;
        }
        if (index >= 0 && index < this.state.images.length) {
            this._index = index;
        }
        // 先滑动到指定index位置，再开启定时任务
        this._scrollView.scrollTo({x:this._index * screenWidth},true);
        // 重置小圆点指示器
        this._refreshFocusIndicator();
        this._runFocusImage();
    }

    _onScroll(){

    }

    _runFocusImage(){
        if(this._max <= 1){ // 只有一个则不启动定时任务
            return;
        }
        this._timer = setInterval(function () {
            this._index++;
            if(this._index >= this._max){
                this._index = 0;
            }
            this._scrollView.scrollTo({x:this._index * screenWidth},true);
            // 重置小圆点指示器
            this._refreshFocusIndicator();
        }.bind(this), 4000);
    }

    _stopFocusImage(){
        clearInterval(this._timer);
    }

    _refreshFocusIndicator(){
        this.setState({selectedImageIndex:this._index});
    }

    _showToast(i) {
        //显示的内容
        var message = '点击: ' + i;
        console.log(message);
    }

    // 组件装载完成
    componentDidMount(){
        this._runFocusImage();
    }

    // 组件即将卸载
    componentWillUnmount(){
        clearInterval(this._timer);
    }

    // 组件接收到新属性
    componentWillReceiveProps(nextProps) {
    }
}

const styles = {
    container: {
        flex:1,
        flexDirection:'row',
    },
    circleContainer: {
        position:'absolute',
        left:0,
        top:120,
    },
    circle: {
        width:6,
        height:6,
        borderRadius:6,
        backgroundColor:'#f4797e',
        marginHorizontal:5,
    },
    circleSelected: {
        width:6,
        height:6,
        borderRadius:6,
        backgroundColor:'#ffffff',
        marginHorizontal:5,
    }
};

FocusImageView.defaultProps = {
    isNeedRun : true,
};

FocusImageView.propTypes = {
    isNeedRun   : PropTypes.bool,
    onItemClick : PropTypes.func,
};