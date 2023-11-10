'use strict';

const config = require('../../lib/config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.get('MAIL_USERNAME'),
        pass: config.get('MAIL_PASSWORD'),
    }
});

async function sendEmail(message) {
    if (config.get('SEND_MAIL_ENABLED')) {
        transporter.sendMail(message, function(err, data) {
            if (err) {
                console.error(err);
                throw new Error('Failed to send email');
            } else {
                console.info('Message send successfully!', data);
            }
        });
    } else {
        console.debug(message);
    }
}

module.exports = {
    sendEmail,
};
