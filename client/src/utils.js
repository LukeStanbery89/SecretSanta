function isRosterEntriesEqual(first, second) {
    return first.name === second.name && first.phoneNumber === second.phoneNumber;
}

function stripBlacklistFromParticipant(participant) {
    return {
        name: participant.name,
        phoneNumber: participant.phoneNumber
    };
}

export {
    isRosterEntriesEqual,
    stripBlacklistFromParticipant,
};
