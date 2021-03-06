'use strict';

const Auditor = require('./Auditor');
const HyperRequest = require('hyper-request');

class Client {

    constructor (config) { //({url, expireTime, enabled}) {
        config = config || {};
        this._dataBySession = {};
        this._client = new HyperRequest({ baseUrl : config.url });
        this._expireTime = config.expireTime || 60000;
        this._enabled = config.enabled;
    }

    postData (data) {

        if(data instanceof Auditor ){
            data = data.getReport().raw;
        }

        let uid = data.uid;

        setInterval(() => {
            delete this._dataBySession[uid];
        }, this._expireTime);

        if( !Array.isArray(this._dataBySession[uid]) ){
            this._dataBySession[uid] = [];
        }

        if(this._enabled) {
            this._dataBySession[uid].push(this._client.post('/api/v1/analytic', {
                body : data
            }));
        }
    }

    waitTillComplete(uid) {
        if(this._enabled && Array.isArray(this._dataBySession[uid])) {
            return Promise.all(this._dataBySession[uid]);
        }
        return Promise.resolve([]);
    }

}

module.exports = Client;