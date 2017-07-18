/**
 * Created by teiron on 2017/6/27.
 */


let instance = null;

export default class Jump {

    static shareInstance() {
        return new Jump();
    }

    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    openDetail(navigate, params) {
        navigate('Detail', params)
    }

    openList(navigate, params) {
        navigate('List', params)
    }

}
