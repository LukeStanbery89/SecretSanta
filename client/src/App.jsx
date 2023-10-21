import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import NewParticipantForm from './components/NewParticipantForm';
import RosterTable from './components/RosterTable';
import './App.css';

function App() {
    const [roster, setRoster] = useState([]);
    const [name, setName] = useState(null);
    const [phoneNumber, setPhoneNumber] = useState(null);

    function addParticipant(event) {
        event.preventDefault();

        if (newParticipantIsInvalid()) {
            return;
        }

        let updatedRoster = [...roster];
        updatedRoster.push({
            name,
            phoneNumber,
        });
        setRoster(updatedRoster);
    }

    function removeParticipant(index) {
        let updatedRoster = [...roster];
        updatedRoster.splice(index, 1);
        setRoster(updatedRoster);
    }

    function submitRoster() {
        fetch('/api/submit-roster', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            mode: 'cors',
            body: JSON.stringify(roster),
        })
            .then(res => res.json())
            .then(data => console.log(data.message))
            .catch(error => console.error(error));
    }

    function newParticipantIsInvalid() {
        // TODO
        return false;
    }

    function handleTextAreaChange(event) {
        try {
            setRoster(JSON.parse(event.target.value || '[]'));
        } catch (e) {
            alert('Invalid JSON!');
        }
    }

    useEffect(() => {
        document.getElementById('roster-json').value = JSON.stringify(roster);
    }, [roster]);

    return (
        <div className="container">
            <h1>Secret Santa</h1>
            <hr />
            <div className="row">
                <div className="col-lg-5">
                    <h2>Add Participant</h2>
                    <NewParticipantForm addParticipant={addParticipant} setName={setName} setPhoneNumber={setPhoneNumber} />
                </div>
                <div className="col-lg-7">
                    <div className="mb-3">
                        <h2>Participants</h2>
                        <RosterTable roster={roster} setRoster={setRoster} removeParticipant={removeParticipant} />
                    </div>
                    <div className="mb-3">
                        <button type="button" className="btn btn-primary" onClick={submitRoster} disabled={!(roster.length)}>Submit Roster</button>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-xs-12">
                    <div className="mb-3">
                        <textarea name="roster-json" id="roster-json" cols="100" rows="10" defaultValue={JSON.stringify(roster)} onBlur={handleTextAreaChange}></textarea>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;