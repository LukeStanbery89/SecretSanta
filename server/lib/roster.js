'use strict';

const assert = require('node:assert');
const _ = require('lodash');
const { sendSMS } = require('./sms');

function handleRosterSubmission(params) {
    return _validate(params)
        .then(_formatPhoneNumbers)
        .then(_assignSecretSantas)
        .then(_dispatchAssignmentNotifications);
}

// TODO: Add validation to ensure that the entire roster is not blacklisted.
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
        resolve({
            ...params,
            roster: _generateSecretSantaAssignments(roster),
        });
    });
}

function _generateSecretSantaAssignments(roster) {
    /**
     * The secret santa assignment algorithm works like this...
     *
     * 1. Create a copy of the original roster (to avoid mutation).
     * 2. Shuffle the copy. This is where we get our randomness from.
     * 3. Iterate over the shuffled copy and assign shuffledRoster[n+1]
     *    to shuffledRoster[n]. This ensures that no recipient is
     *    assigned to themself, no one is assigned twice, and no one
     *    gives and receives with the same person.
     * 4. Validate that the secret santa assignments do not violate the
     *    blacklist. If there are blacklist violations, recursively
     *    rerun the algorithm until we have an adherant roster.
     */
    let shuffledRoster = _.shuffle([...roster]);
    let rosterWithSecretSantas = shuffledRoster.map((participant, i) => {
        return {
            ...participant,
            secretSanta: shuffledRoster[i + 1] ? shuffledRoster[i + 1] : shuffledRoster[0],
        };
    });

    const result = _rosterViolatesBlacklistRestrictions(rosterWithSecretSantas);
    if (result) {
        return _generateSecretSantaAssignments(roster);
    } else {
        return rosterWithSecretSantas;
    }
}

function _rosterViolatesBlacklistRestrictions(roster) {
    return _.find(roster, p => {
        return _.find(p.blacklist, bl => {
            return bl.name === p.secretSanta.name;
        });
    });
}

function _dispatchAssignmentNotifications(params) {
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