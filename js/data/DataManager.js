import MovieInfo from '../model/MovieInfo';
import CategoryInfo from '../model/CategoryInfo'
import Constant from '../util/Constant';


var DOMParser = require('xmldom').DOMParser;
var gb2312 = require("encode-gb2312");
var axios = require("axios");

let dataManagerInstance = null;

export default class DataManager {

    static shareInstance() {
        return new DataManager();
    }

    constructor() {
        if (!dataManagerInstance) {
            dataManagerInstance = this;
        }
        return dataManagerInstance;
    }

    getBannerList(failure, success) {
        failure = this._checkFailure(failure);
        success = this._checkSuccess(success);
        return this._fetchHtml(Constant.DYTT_BASE_URL, failure, function (text) {
            let bannerInfos = this._bannerListParser(text);
            this._fillImageUrl(bannerInfos, function (movieinfos) {
                let response = this._makeResponse(movieinfos)
                success(response);
            }.bind(this));
        }.bind(this));
    }

    getRecommendList(page, failure, success) {
        let url = Constant.DYTT_RECOMMEND_UR;
        this.getList(url, page, failure, success);
    }

    getMovieDetail(movieInfo, failure, success) {
        failure = this._checkFailure(failure);
        success = this._checkSuccess(success);
        return this._fetchHtml(movieInfo.detailUrl, failure, function (text) {
            let infoData = this._detailInfoParser(text);
            movieInfo.detailHtml = infoData.resource.detailHtml;
            movieInfo.downloadUrls = infoData.resource.downloadUrls;
            let response = this._makeResponse(movieInfo, null);
            success(response);
        }.bind(this));
    }

    getAllCategory(failure, success) {
        failure = this._checkFailure(failure);
        success = this._checkSuccess(success);
        return this._fetchHomeHtml(failure, function (text) {
            let infoData = this._categoryParser(text);
            let response = this._makeResponse(infoData.resource, null);
            success(response);
        }.bind(this));
    }

    getList(url, page, failure, success) {
        failure = this._checkFailure(failure);
        success = this._checkSuccess(success);
        if (page > 1) {
            url = url.replace("index.html", "index_" + page + ".html");
        }
        let baseUrl = url.substring(0, url.indexOf("/", 7));
        return this._fetchHtml(url, failure, function (text) {
            let infoData = this._listParser(text, baseUrl);
            if (infoData) {
                let response = this._makeResponse(infoData.resource, null, {maxPage: infoData.maxPage});
                success(response);
            } else {
                failure(new Error('The infoData is empty'));
            }
        }.bind(this));
    }

    getSearchList(searchUrl, keyword, page, failure, success) {
        failure = this._checkFailure(failure);
        success = this._checkSuccess(success);
        if (!page || page < 1) {
            page = 1;
        }

        let config = {
            responseType: 'blob',
        };

        let url;
        if (searchUrl && page > 1) {
            url = searchUrl.replace(".html", "-page-" + (page - 1) + ".html");
            config.method = "get";
        } else {
            let gb2312Keyword = "";
            if (keyword) {
                keyword = gb2312.encodeToGb2312(keyword);
                for (let i = 0; i < keyword.length; i++) {
                    let word = keyword[i];
                    if (i % 2 == 0) {
                        gb2312Keyword += "%";
                    }
                    gb2312Keyword += word;
                }
            }
            url = Constant.DYTT_SEARCH_UR;
            config.method = "post";
            config.headers = {"Content-Type": "application/x-www-form-urlencoded"};
            config.transformRequest = [function(data){
                //在这里根据自己的需求改变数据
                return 'classid=0&show=title%2Csmalltext&tempid=1&keyboard=' + gb2312Keyword + '&Submit=%C1%A2%BC%B4%CB%D1%CB%F7';
            }]
        }
        config.url = url;
        let baseUrl = url.substring(0, url.indexOf("/", 7));
        return this._fetchHtmlWithParams(config, failure, function (text, url) {
            let infoData = this._listParser(text, baseUrl);
            if (infoData) {
                let response;
                if (infoData.isEmpty) {
                    response = this._makeResponse([], null, null);
                } else {
                    response = this._makeResponse(infoData.resource, null, {maxPage: infoData.maxPage, searchUrl: url});
                }
                success(response);
            } else {
                failure(new Error('The infoData is empty'));
            }
        }.bind(this));
    }

    _bannerListParser(htmlText) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, "text/html")
        let co_area2 = this._lookUpClass(doc, "div", "co_area2", "新片");
        let content = this._lookUpClass(co_area2, "div", "co_content222", "");
        let lis = content.getElementsByTagName("li");
        let as = this._searchTarget(lis, "a", 0);
        as.splice(0, 1);
        let spans = this._searchTarget(lis, "span", 0);
        let focusInfos = [];
        for (let i = 0; i < as.length; i++) {
            let a = as[i];
            let span = spans[i];
            let movieInfo = new MovieInfo();
            movieInfo.name = a.textContent;
            movieInfo.date = span.textContent;
            movieInfo.detailUrl = Constant.DYTT_BASE_URL + a.getAttribute("href");
            console.log(a.textContent);
            console.log(span.textContent);
            focusInfos.push(movieInfo);
        }
        return focusInfos;
    }

    _listParser(htmlText, baseUrl) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, "text/html")
        let content = this._lookUpClass(doc, "div", "co_content8", "日期");
        let infoData;
        if (content) {
            let tables = content.getElementsByTagName("table");
            let trs = this._searchTarget(tables, "tr", 1);
            let trs2 = this._searchTarget(tables, "tr", 2);
            let trs3 = this._searchTarget(tables, "tr", 3);
            let recommendInfos = [];
            infoData = {};
            for (let i = 0; i < trs.length; i++) {
                let tr = trs[i];
                let tr2 = trs2[i];
                let tr3 = trs3[i];
                let movieInfo = new MovieInfo();
                let as = tr.getElementsByTagName("a");
                if (as && as.length) {
                    let a = as[as.length - 1];
                    movieInfo.name = a.textContent;
                    movieInfo.detailUrl = baseUrl + a.getAttribute("href");
                }
                movieInfo.date = tr2.textContent.replace(/[\r\n]/g, "").trim().replace("点击：0", "");
                movieInfo.summary = tr3.textContent.replace(/[\r\n]/g, "").trim();
                recommendInfos.push(movieInfo);
            }
            infoData.resource = recommendInfos;
            let x = this._lookUpClass(doc, "div", "x", "页");
            let as = x.getElementsByTagName("a");
            if (as && as.length) {
                let a = as[0];
                let title = a.getAttribute("title");
                if (title == "总数") {
                    let bs = a.getElementsByTagName("b");
                    if (bs && bs.length) {
                        let b = bs[0];
                        infoData.maxPage = parseFloat(b.textContent) / 20;
                    }
                }
            }
            if (infoData.maxPage == undefined) {
                infoData.maxPage = parseInt(x.textContent.substring(x.textContent.indexOf("/") + 1, x.textContent.indexOf("每页")));
            }
        } else if (htmlText.indexOf("如果您的浏览器没有自动跳转，请点击这里")) {
            infoData = {};
            infoData.isEmpty = true;
        }
        return infoData;
    }

    // _searchParser(htmlText, baseUrl) {
    //     let parser = new DOMParser();
    //     let doc = parser.parseFromString(htmlText, "text/html")
    //     let content = this._lookUpClass(doc, "div", "co_content8", "首页");
    //     let tables = content.getElementsByTagName("table");
    //     let trs0 = this._searchTarget(tables, "tr", 0);
    //     let trs1 = this._searchTarget(tables, "tr", 1);
    //     let searchInfos = [];
    //     let infoData = {};
    //     for (let i = 0; i < trs0.length; i++) {
    //         let tr0 = trs0[i];
    //         if (i == trs0.length - 1) {
    //             let as = tr0.getElementsByTagName("a");
    //             let a = as[as.length - 1];
    //             let href = a.getAttribute("href");
    //             console.log(as.length);
    //             infoData.maxPage = href.substring(href.indexOf("PageNo=") + 7);
    //         } else {
    //
    //             let tr1 = trs1[i];
    //             let movieInfo = new MovieInfo();
    //             let as = tr0.getElementsByTagName("a");
    //             if (as && as.length) {
    //                 let a = as[as.length - 1];
    //                 movieInfo.name = a.textContent;
    //                 movieInfo.detailUrl = baseUrl + a.getAttribute("href");
    //             }
    //             // movieInfo.date = tr2.textContent.replace(/[\r\n]/g, "").trim().replace("点击：0", "");
    //             movieInfo.summary = tr1.textContent.replace(/[\r\n]/g, "").trim();
    //             movieInfo.date = movieInfo.summary.substring(movieInfo.summary.indexOf("(") + 1, movieInfo.summary.indexOf(")"));
    //             searchInfos.push(movieInfo);
    //         }
    //     }
    //     infoData.resource = searchInfos;
    //     return infoData;
    // }

    _detailInfoParser(htmlText) {
        let parser = new DOMParser();
        let infoData = {};
        let detailHtml = htmlText.substring(htmlText.indexOf('<p>', htmlText.indexOf('<div id="Zoom">')), htmlText.lastIndexOf("</p>", htmlText.indexOf("迅雷下载地址")));
        let downloadUrls = this._getDownloadUrls(htmlText);
        infoData.resource = {detailHtml: detailHtml, downloadUrls: downloadUrls};
        return infoData;
    }

    _categoryParser(htmlText) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, "text/html")
        let infoData = {};
        let categoryInfos = [];
        let menu = doc.getElementById("menu");
        as = menu.getElementsByTagName("a");
        let categorys = ["动作片", "剧情片", "爱情片", "喜剧片", "科幻片", "恐怖片", "动画片", "惊悚片", "战争片", "犯罪片", "华语连续剧", "美剧", "日韩剧", "综艺", "动漫资源"];
        for (let i = 0; i < as.length; i++) {
            let a = as[i];
            let categoryInfo = new CategoryInfo();
            categoryInfo.name = a.textContent;
            if (categorys.indexOf(categoryInfo.name) == -1) {
                continue;
            }
            categoryInfo.listUrl = a.getAttribute("href");
            if (categoryInfo.listUrl.indexOf("http://") == -1) {
                categoryInfo.listUrl = Constant.DYTT_BASE_URL + categoryInfo.listUrl;
            }
            categoryInfos.push(categoryInfo);
        }
        infoData.resource = categoryInfos
        return infoData;
    }

    _lookUpClass(doc, tag, className, indexStr) {
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

    _searchTarget(elements, targetName, index) {
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

    _fillImageUrl(movieinfos, callback) {
        if (movieinfos) {
            let completeCount = 0;
            for (let i = 0; i < movieinfos.length; i++) {
                let movieinfo = movieinfos[i];
                if (movieinfo && movieinfo.detailUrl) {
                    this._fetchHtml(movieinfo.detailUrl, function (error) {
                        completeCount++;
                        if (callback && completeCount == movieinfos.length) {
                            callback(movieinfos);
                        }
                    }, function (text) {
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
                    }.bind(this));
                }
            }
        }
    }

    _fetchHomeHtml(failure, success) {
        return this._fetchHtml(Constant.DYTT_BASE_URL, failure, function (text) {
            if (text.indexOf("新片") != -1) {
                success(text);
            } else {
                text = text.substring(0, 55);
                let path = text.substring(text.lastIndexOf('=') + 1, text.indexOf('">'))
                let indexUrl = Constant.DYTT_BASE_URL + "/" + path;
                return this._fetchHtml(indexUrl, failure, function (text) {
                    success(text);
                }.bind(this));
            }
        }.bind(this));
    }

    _fetchHtml(url, failure, success) {
        let config = {
            method: 'get',
            url: url,
            responseType: 'blob',
        };
        this._fetchHtmlWithParams(config, failure, success)
    }

    _fetchHtmlWithParams(config, failure, success) {
        axios.request(config).then(function (response) {
            if (response.status == 200) {
                var reader = new FileReader();
                reader.onerror = function () {
                    failure(new Error('read html text error'));
                }
                reader.onload = function () {
                    var text = reader.result;
                    text = this.cleanIllegalCharacters(text);
                    success(text, response.request.responseURL);
                }.bind(this);
                reader.readAsText(response.data, 'gb2312');
            } else {
                failure(new Error('http status = ' + response.status));
            }
        }.bind(this)).catch(function (error) {
            failure(error);
        });
        // fetch(url, init).then(function (response) {
        //     if (response.ok) {
        //         response.blob().then(function (blob) {
        //             var reader = new FileReader();
        //             reader.onerror = function () {
        //                 failure(new Error('read html text error'));
        //             }
        //             reader.onload = function () {
        //                 var text = reader.result;
        //                 text = this.cleanIllegalCharacters(text);
        //                 success(text, response.url);
        //             }.bind(this)
        //             reader.readAsText(blob, 'gb2312');
        //         }.bind(this));
        //     } else {
        //         failure(new Error('http status = ' + response.status));
        //     }
        // }.bind(this), function (error) {
        //     failure(error);
        // });
    }

    _replaceAll(string, search, replacement) {
        return string.replace(new RegExp(search, 'g'), replacement);
    }

    cleanIllegalCharacters(text) {
        text = this._replaceAll(text, "&middot;", "");
        text = this._replaceAll(text, "&hellip;", "");
        text = this._replaceAll(text, "&ldquo;", "");
        text = this._replaceAll(text, "&rdquo;", "");
        text = this._replaceAll(text, "&mdash;", "");
        text = this._replaceAll(text, "&eacute;", "");
        text = this._replaceAll(text, "&Agrave;", "");
        text = this._replaceAll(text, "&aelig;", "");
        text = this._replaceAll(text, "&ocirc;", "");
        text = this._replaceAll(text, "&aacute;", "");
        text = this._replaceAll(text, "&bull;", "");
        text = this._replaceAll(text, "&egrave;", "");
        text = this._replaceAll(text, "&ucirc;", "");
        if (text.indexOf('<div style="display:none;"><script') != -1) {
            let illegalStr = text.substring(text.lastIndexOf("<div"), text.lastIndexOf("</div") + 6);
            text = text.replace(illegalStr, "");
        }
        return text;
    }

    _makeResponse(data, error, userInfo) {
        return {
            data: data,
            error: error,
            userInfo: userInfo
        }
    }

    _checkFailure(failure) {
        if (!failure) {
            failure = function (error) {

            }
        }
        return failure;
    }

    _checkSuccess(success) {
        if (!success) {
            success = function (response) {

            }
        }
        return success;
    }

    _getDownloadUrls(htmlText) {
        let downloadUrls = [];
        let fromindex = 0;
        while (htmlText.indexOf('href="ftp://', fromindex) != -1) {
            let start = htmlText.indexOf('href="ftp://', fromindex) + 6;
            let end = htmlText.indexOf('"', start);
            let downloadUrl = htmlText.substring(start, end);
            downloadUrls.push(downloadUrl);
            fromindex = end;
        }
        return downloadUrls;
    }

}


