'use strict';

class Entry {
    constructor(){
        this._entry = {
            pageref: 'page_0',
            startedDateTime: new Date().toISOString(),
            time: 50,
            request:
                {
                    method: 'GET',
                    url: 'http://www.no-url.com',
                    httpVersion: 'HTTP/1.1',
                    cookies: [],
                    headers: [],
                    queryString: [],
                    postData:
                        {
                            mimeType: 'multipart/form-data',
                            params: [],
                            text: 'plain posted data',
                            comment: ''
                        },
                    headersSize: 150,
                    bodySize: 0,
                    comment: ''
                },
            response: {
                status: 200,
                statusText: 'OK',
                httpVersion: 'HTTP/1.1',
                cookies: [],
                headers: [],
                content: null,
                comment: '',
                headersSize: 150,
                bodySize: 0,
                comment: ''
            },
            cache: {},
            timings: {},
            serverIPAddress: '10.0.0.1',
            connection: '52492',
            comment: ''
        };
    }

    generateCookies (cookiesObj){
        return Object.keys(cookiesObj).map(cookieKey => {
            return {
                name: cookieKey,
                value: cookiesObj[cookieKey],
                path: '/',
                domain: '',
                expires: '2009-07-24T19:20:30.123+02:00',
                httpOnly: false,
                secure: false,
                comment: ''
            };
        });
    }

    generateHeaders (headersObj) {
        return Object.keys(headersObj).map(headerKey => {
            return {
                name: headerKey,
                value: headersObj[headerKey],
                comment: ''
            };
        });
    }

    withResponseCookies(cookiesObj){
        this._entry.response.cookies = this.generateCookies(cookiesObj)
        return this;
    }

    withResponseHeaders(headersObj) {
        this._entry.response.cookies = this.generateHeaders(headersObj);
        return this;
    }

    withRequestUrl(url){
        this._entry.request.url = url;
        return this;
    }

    withRequestMethod(method){
        this._entry.request.method = method;
        return this;
    }

    withRequestHeaders (headersObj) {
        this._entry.request.headers = this.generateHeaders(headersObj);
        return this;
    }
    withRequestCookies (cookiesObj) {
        this._entry.request.cookies = this.generateCookies(cookiesObj);
        return this;
    }

    withResponseCode (code) {
        this._entry.response.status = code;
        return this;
    }

    withResponseContent (content) {
        const text = (typeof content !== 'string')?JSON.stringify(content):content;
        this._entry.response.content = {
            size: text.length,
            compression: 0,
            mimeType: 'text/html; charset=utf-8',
            text: text,
            comment: ''
        };
        return this;
    }

    toJSON(){
        return this._entry;
    }

    toString() {
        return JSON.stringify(this._entry, null, 3);
    }

}

module.exports = Entry;