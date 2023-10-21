import React from 'react';
import BlacklistSelect from './BlacklistSelect';
import { isRosterEntriesEqual } from '../utils';

function RosterTable(props) {
    const { roster, setRoster, removeParticipant } = props;
    let rosterTable;

    function setBlacklist(giver, blacklist = []) {
        for (let i = 0; i < roster.length; i++) {
            if (isRosterEntriesEqual(giver, roster[i])) {
                let newRoster = structuredClone(roster);
                newRoster[i].blacklist = blacklist;
                setRoster(newRoster);
                return;
            }
        }
    }

    if (roster.length) {
        rosterTable = (<table className="table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Blacklist</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {roster.map(
                    (participant, index) => <tr key={`row-${index}`}>
                        <td>{participant.name}</td>
                        <td>{participant.phoneNumber}</td>
                        <td>
                            <BlacklistSelect
                                roster={roster}
                                giver={participant}
                                setRoster={setRoster}
                                setBlacklist={setBlacklist} />
                        </td>
                        <td>
                            <button
                                type="button"
                                className="btn btn-danger btn-sm"
                                onClick={() => removeParticipant(index)}>X</button>
                        </td>
                    </tr>)
                }
            </tbody>
        </table>);
    } else {
        rosterTable = 'No participants added yet';
    }

    return rosterTable;
}

export default RosterTable;