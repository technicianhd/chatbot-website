const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors()); // Frontend eka ekka connect wenna ona nisa
app.use(express.json());

// Google Gemini Setup
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;
        
        // v1beta gemini-2.5-flash model eka use kirima
        const model = ai.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const result = await model.generateContent({
            contents: contents
        });
        
        const responseText = result.response.text();
        res.json({ text: responseText });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error occurred" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
