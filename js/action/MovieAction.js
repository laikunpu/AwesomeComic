/**
 * Created by teiron on 2017/6/13.
 */

import MovieInfo from '../model/MovieInfo.js';
import Constant from '../util/Constant.js';
import * as types from './ActionType';

var DOMParser = require('xmldom').DOMParser;

export function getBannerList(interceptDispatch) {
    return dispatch => _fetchHtml(Constant.DYTT_BANNER_URL, function (error) {

    }, function (text) {
        let bannerInfos = _bannerListParser(text);
        _fillImageUrl(bannerInfos, function (movieinfos) {
            let response = _makeResponse(types.BANNER_LIST, movieinfos)
            if (interceptDispatch) {
                interceptDispatch(response)
            }else {
                dispatch(response);
            }
        });
    });
}

export function bannerLoading() {
    return dispatch => {
        let response = _makeResponse(types.BANNER_LOADING, null)
        dispatch(response);
    }
}

export function getRecommendList(page, interceptDispatch) {
    let url = Constant.DYTT_RECOMMEND_UR;
    if (page) {
        url = url.replace("_1.html", "_" + page + ".html");
    }
    return dispatch => _fetchHtml(url, function (error) {
        console.log(error);
    }, function (text) {
        let infoData = _recommendListParser(text);
        let response = _makeResponse(types.RECOMMEND_LIST, infoData.resource, null, {maxPage: infoData.maxPage});
        if (interceptDispatch) {
            interceptDispatch(response)
        }else {
            dispatch(response);
        }
    });
}

function _bannerListParser(htmlText) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlText, "text/html")
    let content = _lookUpClass(doc, "div", "co_content8", "最新电影下载");
    let trs = content.getElementsByTagName("tr");
    let as = _searchTarget(trs, "a", 1);
    let tds = _searchTarget(trs, "td", 1);
    let focusInfos = [];
    for (let i = 0; i < as.length; i++) {
        let a = as[i];
        let td = tds[i];
        let movieInfo = new MovieInfo();
        movieInfo.name = a.textContent;
        movieInfo.date = td.textContent;
        movieInfo.detailUrl = Constant.DYTT_BASE_URL + a.getAttribute("href");
        console.log(a.textContent);
        console.log(td.textContent);
        focusInfos.push(movieInfo);
    }
    return focusInfos;
}

function _recommendListParser(htmlText) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlText, "text/html")
    let content = _lookUpClass(doc, "div", "co_content8", "日期");
    let tables = content.getElementsByTagName("table");
    let trs = _searchTarget(tables, "tr", 1);
    let trs2 = _searchTarget(tables, "tr", 2);
    let trs3 = _searchTarget(tables, "tr", 3);
    // var tds = _searchTarget(trs, "td", 1);
    let recommendInfos = [];
    let infoData = {};
    for (let i = 0; i < trs.length; i++) {
        let tr = trs[i];
        let tr2 = trs2[i];
        let tr3 = trs3[i];
        let movieInfo = new MovieInfo();
        let as = tr.getElementsByTagName("a");
        if (as && as.length) {
            let a = as[0];
            movieInfo.name = a.textContent;
            movieInfo.detailUrl = Constant.DYTT_BASE_URL + a.getAttribute("href");
        }
        movieInfo.date = tr2.textContent.replace(/[\r\n]/g, "").trim().replace("点击：0", "");
        movieInfo.summary = tr3.textContent.replace(/[\r\n]/g, "").trim();
        recommendInfos.push(movieInfo);
    }
    infoData.resource = recommendInfos;
    let x = _lookUpClass(doc, "div", "x", "首页");
    infoData.maxPage = x.textContent.substring(x.textContent.indexOf("共") + 1, x.textContent.indexOf("页"));
    return infoData;
}

function _lookUpClass(doc, tag, className, indexStr) {
    let tags = doc.getElementsByTagName(tag);
    let classNames = [];
    for (let i = 0; i < tags.length; i++) {
        var tag = tags[i];
        let name = tag.getAttribute("class");
        if (name == className && tag.textContent.indexOf(indexStr) != -1) {
            return tag;
        }
    }
}

function _searchTarget(elements, targetName, index) {
    var targets = [];
    for (let i = 0; i < elements.length; i++) {
        let element = elements[i];
        let subElements = element.getElementsByTagName(targetName);
        let target = subElements[index];
        if (target) {
            targets.push(target);
        }
    }
    return targets;
}

function _fillImageUrl(movieinfos, callback) {
    if (movieinfos) {
        let completeCount = 0;
        for (let i = 0; i < movieinfos.length; i++) {
            let movieinfo = movieinfos[i];
            if (movieinfo && movieinfo.detailUrl) {
                _fetchHtml(movieinfo.detailUrl, function (error) {
                    completeCount++;
                    if (callback && completeCount == movieinfos.length) {
                        callback(movieinfos);
                    }
                }, function (text) {
                    text = _replaceAll(text, "&middot;", "");
                    text = _replaceAll(text, "&hellip;", "");
                    text = _replaceAll(text, "&ldquo;", "");
                    text = _replaceAll(text, "&rdquo;", "");
                    text = _replaceAll(text, "&mdash;", "");
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(text, "text/html")
                    if (doc) {
                        let zoom = doc.getElementById("Zoom");
                        if (zoom.getElementsByTagName("img") && zoom.getElementsByTagName("img").length) {
                            let bannerUrl = zoom.getElementsByTagName("img")[0].getAttribute("src");
                            movieinfo.bannerUrl = bannerUrl;
                            console.log("bannerUrl = " + bannerUrl);
                        }
                    }
                    completeCount++;
                    if (callback && completeCount == movieinfos.length) {
                        callback(movieinfos);
                    }
                });
            }
        }
    }
}

function _fetchHtml(url, failure, success) {
    fetch(url, null).then(function (response) {
        if (response.ok) {
            response.blob().then(function (blob) {
                var reader = new FileReader();
                reader.onerror = function () {
                    failure(new error('read html text error'));
                }
                reader.onload = function () {
                    var text = reader.result;
                    success(text);
                }
                reader.readAsText(blob, 'gb2312');
            });
        } else {
            failure(new error('http status = ' + response.status));
        }
    }, function (error) {
        failure(error);
    });
}

function _replaceAll(string, search, replacement) {
    return string.replace(new RegExp(search, 'g'), replacement);
}

function _makeResponse(type, data, error, userInfo) {
    return {
        type: type,
        data: data,
        error: error,
        userInfo: userInfo
    }
}