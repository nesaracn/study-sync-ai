const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Connects your frontend to this backend safely
app.use(cors());
app.use(express.json());

// This handles requests from your script.js file
app.post('/api/generate', (req, res) => {
    const receivedText = req.body.text;
    console.log("Received text from frontend:", receivedText);

    // Mock response for the hackathon pipeline test
    const mockAiResponse = `[StudySyncs AI]: I received your notes! "${receivedText}"`;

    res.json({ aiOutput: mockAiResponse });
});

app.listen(PORT, () => {
    console.log(`🚀 StudySyncs Backend running smoothly on http://localhost:${PORT}`);
});