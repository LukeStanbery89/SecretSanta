'use strict';

const config = require('../../../lib/config');

const accountSid = config.get('TWILIO_ACCOUNT_SID');
const authToken = config.get('TWILIO_AUTH_TOKEN');
const client = require('twilio')(accountSid, authToken);

async function sendSMS(params) {
    if (!params.body || !params.to) {
        throw new Error('Invalid SMS request format');
    }

    const message = {
        body: params.body,
        from: config.get('TWILIO_NUMBER'),
        to: params.to,
    };

    if (config.get('SMS_ENABLED') === true) {
        console.log(`Sending SMS to ${message.to}...`);
        return client.messages
            .create(message)
            .then(message => console.log(message.sid))
            .catch(error => console.error('Error sending SMS: ', error));
    } else {
        console.log('SMS message: ', message);
    }
}

module.exports = {
    sendSMS,
};
