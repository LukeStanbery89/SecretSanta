import React from 'react';
import BlacklistSelect from './BlacklistSelect';

function RosterTable(props) {
    const { roster, removeParticipant } = props;
    let rosterTable;

    function setBlacklist(giver, blacklist = []) {
        giver.blacklist = blacklist;
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