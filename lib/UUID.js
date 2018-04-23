'use strict';

const crypto = require('crypto');

module.exports = function UUID () {
    let hexstring = crypto.randomBytes(16).toString("hex");
    return `${hexstring.substring(0,8)}-${hexstring.substring(8,12)}-${hexstring.substring(12,16)}-${hexstring.substring(16,20)}-${hexstring.substring(20)}`;
};
