'use strict';

const assert = require('node:assert');
const _ = require('lodash');
// const { sendSMS } = require('../services/sms');
const { sendEmail } = require('../services/email');
const config = require('./config');
const emailValidator = require('email-validator');

function handleRosterSubmission(params) {
    return _validate(params)
        .then(_assignSecretSantas)
        .then(_dispatchAssignmentNotifications);
}

// TODO: Add validation to ensure that the entire roster is not blacklisted.
function _validate(params) {
    const {res, roster} = params;
    return new Promise((resolve, reject) => {
        _validateRosterSize(roster, res, reject);
        _validateSchema(roster, res, reject);
        _validateNoDuplicateEmailAddresses(roster, res, reject);
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
        emailAddress: emailValidator,
    };
    roster.map(participant => {
        for (const [key, value] of Object.entries(schema)) {
            try {
                assert(participant[key]);
                if (value.constructor.name === 'RegExp') {
                    assert(value.test(participant[key]));
                } else if (key === 'emailAddress') {
                    assert(value.validate(participant[key]));
                } else {
                    assert(typeof participant[key] === value);
                }
            } catch (e) {
                console.error({
                    key,
                    format: value,
                    value: participant[key],
                    error: e,
                });
                res.statusMessage = 'Invalid input schema';
                res.status(400).end();
                reject('Invalid input schema');
            }
        }
    });
}

function _validateNoDuplicateEmailAddresses(roster, res, reject) {
    if (config.get('ALLOW_DUPLICATE_EMAIL_ADDRESSES')) {
        return;
    }
    let emailAddressMap = {};
    roster.map(participant => {
        if (emailAddressMap[participant.emailAddress]) {
            emailAddressMap[participant.emailAddress]++;
            if (emailAddressMap[participant.emailAddress] > 1) {
                res.statusMessage = 'Duplicate email addresses';
                res.status(400).end();
                reject('Duplicate email addresses');
            }
        } else {
            emailAddressMap[participant.emailAddress] = 1;
        }
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

    if (_rosterViolatesBlacklistRestrictions(rosterWithSecretSantas)) {
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
        // roster.map(async participant => await sendSMS(_constructSMSMessage(participant)));
        roster.map(async participant => await sendEmail(_constructEmailMessage(participant)));
        resolve(params);
    });
}

// function _constructSMSMessage(participant) {
//     return {
//         to: participant.emailAddress,
//         body: `Hi, ${participant.name}! Welcome to SECRET SANTA! Your secret santa recipient is...\n\n${participant.secretSanta.name}`,
//     };
// }

function _constructEmailMessage(participant) {
    return {
        from: `${config.get('MAIL_USERNAME')}@gmail.com`,
        to: participant.emailAddress,
        subject: 'Your Secret Santa Assignment...',
        text: `Hi, ${participant.name}!\n\nWelcome to SECRET SANTA! Your secret santa recipient is...\n\n${participant.secretSanta.name}`,
    };
}

module.exports = {
    handleRosterSubmission,
};
