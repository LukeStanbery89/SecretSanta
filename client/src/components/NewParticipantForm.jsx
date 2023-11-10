import React from 'react';
import PropTypes from 'prop-types';

function NewParticipantForm(props) {
    const { addParticipant, setName, setEmail } = props;

    return (
        <form onSubmit={addParticipant}>
            <div className="mb-3">
                <label htmlFor="name" className="form-label">Name</label>
                <input type='text' className="form-control" id="name" placeholder='John Doe' onInput={event => setName(event.target.value)} required />
            </div>
            <div className="mb-3">
                <label htmlFor="email-address" className="form-label">Email</label>
                <input type="email" className="form-control" id="email-address" placeholder="name@example.com" onChange={event => {setEmail(event.target.value);}} required />
            </div>
            <div className="mb-3">
                <button type="submit" className="btn btn-secondary">Add Participant</button>
            </div>
        </form>
    );
}

NewParticipantForm.propTypes = {
    addParticipant: PropTypes.func,
    setName: PropTypes.func,
    setEmail: PropTypes.func,
};

export default NewParticipantForm;