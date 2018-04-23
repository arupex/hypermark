
'use strict';

const path = require('path');

const Entry = require('./Entry');
const Har = require('./Har');

class HyperRequestHarBuilder {
    constructor() {
        this._har = new Har();
    }

    addRequest(res) {
        let entry = new Entry();
        this._har.addEntry(entry
            .withRequestUrl(res.request.protocol + '//' + path.join(res.request.baseUrl, res.request.path))
            .withRequestMethod(res.request.method)
            .withRequestCookies(res.request.cookies)
            .withRequestHeaders(res.request.headers)
            .withResponseCode(res.response.statusCode)
            .withResponseContent(res.body)
            .withResponseCookies(res.response.cookies)
            .withResponseHeaders(res.response.headers));
    }

    save(file) {
        this._har.save(file);
    }
}

module.exports = HyperRequestHarBuilder;