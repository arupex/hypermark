'use strict';

const fs = require('fs');

class Har {

    constructor(){
        this._har = {
            log: {
                version: '1.2',
                creator: {},
                browser: {},
                pages: [
                    {
                        startedDateTime: new Date().toISOString(),
                        id: 'page_0',
                        title: 'Test Page',
                        pageTimings: {
                            onContentLoad: 1720,
                            onLoad: 2500,
                            comment: ''
                        }
                    }
                ],
                entries: []
            }
        };
    }

    save (file) {
        fs.writeFileSync(file, this.toString(), 'utf8');
    }


    addEntry (entry) {
        this._har.entities.push(entry.toJSON());
        return this;
    }


    toString() {
        return JSON.stringify(this._har, null, 3);
    }

}


module.exports = Har;