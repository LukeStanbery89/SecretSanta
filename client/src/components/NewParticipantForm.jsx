import React from 'react';

const phoneFormat = '[0-9]{3}-[0-9]{3}-[0-9]{4}';

function NewParticipantForm(props) {
    const { addParticipant, setName, setPhoneNumber } = props;

    return (
        <form onSubmit={addParticipant}>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type='text' className="form-control" id="name" placeholder='John Doe' onInput={event => setName(event.target.value)} required />
            </div>
            <div className="mb-3">
                <label htmlFor="phone-number" className="form-label">Phone Number (format: 555-555-555)</label>
                <input type="tel" className="form-control" id="phone-number" placeholder="555-555-5555" pattern={phoneFormat} onChange={event => {setPhoneNumber(event.target.value);}} required />
            </div>
            <div className="mb-3">
                <button type="submit" className="btn btn-secondary">Add Participant</button>
            </div>
        </form>
    );
}

NewParticipantForm.propTypes = {
    addParticipant: Function,
    setName: Function,
    setPhoneNumber: Function,
};

export default NewParticipantForm;