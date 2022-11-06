require('dotenv').config();
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;
const { handleRosterSubmission } = require('./lib/roster');

app.use(express.json());

app.post('/api/submit-roster', async (req, res) => {
    const roster = req.body;
    await handleRosterSubmission({req, res, roster});
    res.json({ message: "Received!" });
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});