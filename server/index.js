'use strict';

require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { handleRosterSubmission } = require('./lib/roster');

app.use(express.json());

app.post('/api/submit-roster', (req, res) => {
    const roster = req.body;
    handleRosterSubmission({req, res, roster})
        .then(() => {
            res.json({ message: 'Success!' });
        })
        .catch((error) => {
            console.error('[ERROR]', error);
        });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});