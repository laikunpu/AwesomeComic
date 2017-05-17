
var DOMParser = require('xmldom').DOMParser;

// var DOMParser = require('react-native-html-parser').DOMParser;

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

    getFocusInfo(success, failure) {
        if (!success) {
            success = function (dataInfo) {

            }
        }
        if (!failure) {
            failure = function (error) {

            }
        }
        var that = this;
        fetch("http://www.dytt8.net/", null).then(function (response) {
            if (response.ok) {
                response.blob().then(function (blob) {
                    var reader = new FileReader();
                    reader.onerror = function() {
                        failure(new error('read html text error'));
                    }
                    reader.onload = function() {
                        var text = reader.result;
                        success(that._focusInfoParser(text));
                    }
                    reader.readAsText(blob, 'GBK');
                });
            } else {
                failure(new error('http status = ' + response.status));
            }
        }, function (error) {
            failure(error);
        });
    }

    _focusInfoParser(htmlText) {
        let parser = new DOMParser();
        let doc = parser.parseFromString(htmlText, "text/html")
        // var content = doc.querySelect("div.co_content8");
        // console.log("content = " + content.textContent);
        this._lookUpTargets(doc, "div.co_content8[1]>tr>td>a[1]");
        // var divs = doc.getElementsByTagName("div");
        // for (let i = 0; i < divs.length; i++) {
        //     let div = divs[i];
        //     let className = div.getAttribute("class");
        //     if (className == "co_content8") {
        //         // console.log("div = " + div.getAttribute("textContent"));
        //         let trs = div.getElementsByTagName("tr");
        //         for (let j = 0; j < trs.length; j++) {
        //             let tr = trs[j];
        //             let tds = tr.getElementsByTagName("td");
        //             for (let z = 0; z < tds.length; z++) {
        //                 if (z == 0) {
        //                     let td = tds[z];
        //                     let as = tr.getElementsByTagName("a");
        //                     for (let k = 0; k < as.length; k++) {
        //                         if (k == 1) {
        //                             let a = as[k];
        //                             console.log("a.href = " + a.getAttribute("href"));
        //                             console.log("a.href = " + a.textContent);
        //                         }
        //                     }
        //                 }
        //             }
        //
        //         }
        //         break;
        //     }
        // }
    }

    _lookUpTargets(doc, targetRule) {
        if (doc && targetRule) {
            let rules = targetRule.split(">");
            for (let i = 0; i < rules.length; i++) {

            }
        }
    }


}


