/**
 * Created by teiron on 2017/6/19.
 */

import React from 'react';
// import TabNavigator from 'react-native-tab-navigator';
import {
    StackNavigator,
    TabNavigator
} from 'react-navigation';

import Recommend from './Recommend';
import Category from './Category'
import Detail from  './Detail'
import List from './List'
import {
    Image,
} from 'react-native';

const MainScreenNavigator = TabNavigator({
    Recommend: {
        screen: Recommend,
        navigationOptions: ({navigation}) => ({
            tabBarLabel: "推荐",
            tabBarIcon:({focused,tintColor})=>(
                <Image
                    source={focused?require('../../resource/image/recommend_focus.png'):require('../../resource/image/recommend_normal.png')}
                    style={styles.icon}
                />
            )
        })
    },
    Category: {
        screen: Category,
        navigationOptions: ({navigation}) => ({
            tabBarLabel: "分类",
            tabBarIcon:({focused,tintColor})=>(
                <Image
                    source={focused?require('../../resource/image/category_focus.png'):require('../../resource/image/category_normal.png')}
                    style={styles.icon}
                />
            )
        })
    },
}, {
    navigationOptions: ({navigation}) => ({
        tabBarVisible: navigation.state.params ? (!navigation.state.params.hideTabbar) : true
    }),
    animationEnabled: false, // 切换页面时不显示动画
    tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
    swipeEnabled: false, // 禁止左右滑动
    backBehavior: 'none', // 按 back 键是否跳转到第一个 Tab， none 为不跳转
    tabBarOptions: {
        activeTintColor: '#007aff', // 文字和图片选中颜色
        inactiveTintColor: '#999999', // 文字和图片默认颜色
        showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
        indicatorStyle: {height: 0}, // android 中TabBar下面会显示一条线，高度设为 0 后就不显示线了
        style: {
            backgroundColor: '#ffffff', // TabBar 背景色
        },
        labelStyle: {
            fontSize: 12, // 文字大小
        },
    },

});

const styles = {
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    icon: {
        height: 23,
        width: 23,
        resizeMode: 'contain'
    }
};

const Navigation = StackNavigator({
    Home: {
        screen: MainScreenNavigator,
        navigationOptions: ({navigation}) => {
            var options = {};
            if (navigation.state.index == 0) {
                options.header = null;
            }else {
                options.title = "分类";
            }
            return options;
        },
    },
    Detail: {
        screen: Detail,
        navigationOptions: ({navigation}) => ({
            title: "详情",
            // header: null
        }),
    },
    List: {
        screen: List, navigationOptions: ({navigation}) => ({
            title: navigation.state.params.categoryInfo.name,
        })
    },
}, {
    navigationOptions: {
        headerStyle: {
            backgroundColor: '#ffffff',
        },
    },

});

export default Navigation;


