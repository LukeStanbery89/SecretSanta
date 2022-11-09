import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

function BlacklistSelect(props) {
    const { roster, giver, setBlacklist } = props;

    function handleChange(event) {
        const selected = _.filter(event.target.options, o => o.selected && o.value).map(o => o.value && JSON.parse(o.value));
        setBlacklist(giver, selected);
    }

    return (
        <select onChange={handleChange} multiple>
            <option value="">N/A</option>
            {roster.map((receiver, i) => {
                return (<option key={i} value={JSON.stringify(receiver)}>{receiver.name}</option>);
            })}
        </select>
    );
}

BlacklistSelect.propTypes = {
    roster: PropTypes.array,
    giver: PropTypes.object,
    setBlacklist: PropTypes.func,
};

export default BlacklistSelect;