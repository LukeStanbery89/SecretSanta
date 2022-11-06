import React from 'react';

function RosterTable(props) {
    const { roster, removeParticipant } = props;
    let rosterTable;

    function joinParticipantNames(blacklist) {
        if (!blacklist || !blacklist.length) {
            return '';
        }
        return blacklist.map(p => p.name).join(', ');
    }

    if (roster.length) {
        rosterTable = (<table className="table">
            <thead>
                <tr>
                    <th>Key</th>
                    <th>Name</th>
                    <th>Phone Number</th>
                    <th>Blacklist</th>
                    <th>Delete</th>
                </tr>
            </thead>
            <tbody>
                {roster.map(
                    (participant, index) => <tr key={`row-${index}`}>
                        <td>{index}</td>
                        <td>{participant.name}</td>
                        <td>{participant.phoneNumber}</td>
                        <td>{joinParticipantNames(participant.blacklist)}</td>
                        <td><button type="button" className="btn btn-danger btn-sm" onClick={() => removeParticipant(index)}>X</button></td>
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