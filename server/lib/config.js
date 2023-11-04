'use strict';

const config = require('../config.json');

function get(key) {
    return process.env[key] || config[key];
}

module.exports = {
    get,
};
