'use strict';

const assert = require('node:assert');
const { sendSMS } = require('./sms');

function handleRosterSubmission(params) {
    return _validate(params)
        .then(_formatPhoneNumbers)
        .then(_assignSecretSantas)
        .then(_dispatchAssignmentMessages);
}

function _validate(params) {
    const {res, roster} = params;
    return new Promise((resolve, reject) => {
        const schema = {
            name: 'string',
            phoneNumber: new RegExp('[0-9]{3}-[0-9]{3}-[0-9]{4}'),
        };
        roster.map(p => {
            for (const [key, value] of Object.entries(schema)) {
                try {
                    assert(p[key]);
                    switch(value.constructor.name) {
                    case 'RegExp':
                        assert(value.test(p[key]));
                        break;
                    default:
                        assert(typeof p[key] === value);
                        break;
                    }
                } catch (e) {
                    console.error({
                        key,
                        format: value,
                        value: p[key],
                        error: e,
                    });
                    res.statusMessage = 'Invalid input';
                    res.status(400).end();
                    reject('Invalid input');
                }
            }
        });
        resolve(params);
    });
}

function _formatPhoneNumbers(params) {
    const {roster} = params;
    return new Promise((resolve) => {
        const phoneFormattedRoster = roster.map(p => {
            return {
                ...p,
                phoneNumber: `+1${p.phoneNumber.replaceAll('-','')}`,
            };
        });
        resolve({
            ...params,
            roster: phoneFormattedRoster,
        });
    });
}

function _assignSecretSantas(params) {
    const {roster} = params;
    return new Promise((resolve) => {
        // TODO
        let rosterWithSecretSantas = [...roster];
        resolve({
            ...params,
            roster: rosterWithSecretSantas,
        });
    });
}

function _dispatchAssignmentMessages(params) {
    const {roster} = params;
    return new Promise((resolve) => {
        roster.map(async participant => await sendSMS(_constructSMSMessage(participant)));
        resolve(params);
    });
}

function _constructSMSMessage(participant) {
    return {
        to: participant.phoneNumber,
        body: `Hi, ${participant.name}! Welcome to SECRET SANTA! Your secret santa recipient is...\n\n${participant.secretSanta}`,
    };
}

module.exports = {
    handleRosterSubmission,
};