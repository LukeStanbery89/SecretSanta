'use strict';

const assert = require('node:assert');
const { shuffle } = require('../utils/data-utils');
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
        _validateRosterSize(roster, res, reject);
        _validateSchema(roster, res, reject);
        _validateNoDuplicatePhoneNumbers(roster, res, reject);
        resolve(params);
    });
}

function _validateRosterSize(roster, res, reject) {
    if (roster.length <= 2) {
        res.statusMessage = 'Invalid input schema';
        res.status(400).end();
        reject('Not enough participants');
    }
}

function _validateSchema(roster, res, reject) {
    const schema = {
        name: 'string',
        phoneNumber: new RegExp('[0-9]{3}-[0-9]{3}-[0-9]{4}'),
    };
    roster.map(p => {
        for (const [key, value] of Object.entries(schema)) {
            try {
                assert(p[key]);
                switch (value.constructor.name) {
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
                res.statusMessage = 'Invalid input schema';
                res.status(400).end();
                reject('Invalid input schema');
            }
        }
    });
}

function _validateNoDuplicatePhoneNumbers(roster, res, reject) {
    if (process.env.ALLOW_DUPLICATE_PHONE_NUMBERS === true || process.env.ALLOW_DUPLICATE_PHONE_NUMBERS === 'true') {
        return;
    }
    let phoneMap = {};
    roster.map(participant => {
        if (phoneMap[participant.phoneNumber]) {
            phoneMap[participant.phoneNumber]++;
            if (phoneMap[participant.phoneNumber] > 1) {
                res.statusMessage = 'Duplicate phone numbers';
                res.status(400).end();
                reject('Duplicate phone numbers');
            }
        } else {
            phoneMap[participant.phoneNumber] = 1;
        }
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
        /**
         * The secret santa assignment algorithm works like this...
         *
         * 1. Create a copy of the original roster (to avoid mutation).
         * 2. Shuffle the copy. This is where we get our randomness from.
         * 3. Iterate over the shuffled copy and assign shuffledRoster[n + 1]
         *    to shuffledRoster[n]. This ensures that no recipient is
         *    assigned to themself, no one is assigned twice, and no one
         *    gives and receives with the same person.
         *
         * TODO: Integrate blacklist functionality so that gifters are not
         * assigned recipients they are not supposed to receive. This is
         * good, for example, for couples who intend to give each other gifts
         * independently of secret santa.
         */
        let shuffledRoster = shuffle([...roster]);
        let rosterWithSecretSantas = shuffledRoster.map((participant, i) => {
            return {
                ...participant,
                secretSanta: shuffledRoster[i + 1] ? shuffledRoster[i + 1] : shuffledRoster[0],
            };
        });
        resolve({
            ...params,
            roster: rosterWithSecretSantas,
        });
    });
}

function _dispatchAssignmentMessages(params) {
    const {roster} = params;
    console.log('================================================================');
    return new Promise((resolve) => {
        roster.map(async participant => await sendSMS(_constructSMSMessage(participant)));
        resolve(params);
    });
}

function _constructSMSMessage(participant) {
    return {
        to: participant.phoneNumber,
        body: `Hi, ${participant.name}! Welcome to SECRET SANTA! Your secret santa recipient is...\n\n${participant.secretSanta.name}`,
    };
}

module.exports = {
    handleRosterSubmission,
};