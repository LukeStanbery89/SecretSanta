import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { isRosterEntriesEqual, stripBlacklistFromParticipant } from '../utils';

function BlacklistSelect(props) {
    const { roster, giver, setBlacklist } = props;

    function handleChange(event) {
        const selected = _.filter(event.target.options, o => o.selected && o.value).map(o => o.value && JSON.parse(o.value));
        setBlacklist(giver, selected);
    }

    function isInBlacklist(giver, receiver) {
        if (giver.blacklist && giver.blacklist.length) {
            for (let i = 0; i < giver.blacklist.length; i++) {
                const participant = giver.blacklist[i];
                if (isRosterEntriesEqual(participant, receiver)) {
                    return true;
                }
            }
        }
        return false;
    }

    return (
        <select onChange={handleChange} multiple>
            <option value="">N/A</option>
            {roster.map((receiver, i) => {
                // Do not display self in the list
                if (!isRosterEntriesEqual(receiver, giver)) {
                    return (
                        <option
                            key={i}
                            value={JSON.stringify(stripBlacklistFromParticipant(receiver))}
                            selected={isInBlacklist(giver, receiver)}>
                            {receiver.name}
                        </option>
                    );
                }
            })}
        </select>
    );
}

BlacklistSelect.propTypes = {
    roster: PropTypes.array,
    giver: PropTypes.object,
    setRoster: PropTypes.func,
    setBlacklist: PropTypes.func,
};

export default BlacklistSelect;
