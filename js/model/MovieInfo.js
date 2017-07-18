export default class MovieInfo {
    get name() {
        return this._name;
    }

    set name(name) {
        this._name = name;
    }

    get iconUrl() {
        return this._iconUrl;
    }

    set iconUrl(iconUrl) {
        this._iconUrl = iconUrl;
    }

    get bannerUrl() {
        return this._bannerUrl;
    }

    set bannerUrl(bannerUrl) {
        this._bannerUrl = bannerUrl;
    }

    get summary() {
        return this._summary;
    }

    set summary(summary) {
        this._summary = summary;
    }

    get date() {
        return this._date;
    }

    set date(date) {
        this._date = date;
    }

    get detailUrl() {
        return this._detailUrl;
    }

    set detailUrl(detailUrl) {
        this._detailUrl = detailUrl;
    }

    get detailHtml() {
        return this._detailHtml;
    }

    set detailHtml(detailHtml) {
        this._detailHtml = detailHtml;
    }

    get downloadUrls() {
        return this._downloadUrls;
    }

    set downloadUrls(downloadUrls) {
        this._downloadUrls = downloadUrls;
    }
}