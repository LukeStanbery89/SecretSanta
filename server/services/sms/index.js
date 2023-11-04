'use strict';

const config = require('../../lib/config');
const providerName = config.get('SMS_PROVIDER');
const smsProvider = require('./providers/' + providerName);
console.log('smsProvider', providerName, smsProvider);

async function sendSMS(params) {
    await smsProvider.sendSMS(params);
}

module.exports = {
    sendSMS,
};
