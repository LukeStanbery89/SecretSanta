'use strict';

const { Vonage } = require('@vonage/server-sdk');
const config = require('../../../lib/config');
const from = config.get('VONAGE_NUMBER');
const vonage = new Vonage({
    apiKey: config.get('VONAGE_KEY'),
    apiSecret: config.get('VONAGE_SECRET'),
});

async function sendSMS(params) {
    if (!params.body || !params.to) {
        throw new Error('Invalid SMS request format');
    }

    const message = {
        from: from,
        to: params.to,
        text: params.body,
    };

    if (config.get('SEND_MAIL_ENABLED')) {
        await vonage.sms.send(message)
            .then(resp => { console.log('Message sent successfully'); console.log(resp); })
            .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
    } else {
        console.log('SMS message: ', message);
    }
}

module.exports = {
    sendSMS,
};
