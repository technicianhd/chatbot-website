// ඇවැසි පැකේජ් සහ මොඩියුල ගෙන්වා ගැනීම
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config(); // .env ෆයිල් එකේ ඇති දත්ත කියවීමට

const app = express();

// වෙනත් ඩොමේන් එකක (GitHub Pages) සිට එන රික්වෙස්ට් වලට ඉඩ දීම (CORS)
app.use(cors());
app.use(express.json());

// Google Gemini API එක සකස් කිරීම (.env එකෙන් API Key එක ගනී)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// චැට් මැසේජ් ලබාගන්නා ප්‍රධාන Endpoint එක
app.post('/api/chat', async (req, res) => {
    try {
        const { contents } = req.body;

        if (!contents || !Array.isArray(contents)) {
            return res.status(400).json({ error: "Invalid chat history format." });
        }
        
        // වඩාත් ස්ථාවර සහ වේගවත් gemini-2.5-flash මොඩලයට සම්බන්ධ වීම
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        // සම්පූර්ණ චැට් හිස්ට්‍රියම Google Gemini වෙත යවා පිළිතුර ලබාගැනීම
        const result = await model.generateContent({ contents });
        const responseText = result.response.text();
        
        // සාර්ථක පිළිතුර සේවාලාභියා (Frontend) වෙත යැවීම
        res.json({ text: responseText });
        
    } catch (error) {
        console.error("Gemini API Error:", error);
        res.status(500).json({ error: "සර්වර් එකෙහි දෝෂයක් ඇතිවිය. කරුණාකර පසුව උත්සාහ කරන්න." });
    }
});

// සර්වර් එක රන් වන පෝර්ට් එක තීරණය කිරීම (Render වැනි තැන් සඳහා process.env.PORT වැදගත් වේ)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running smoothly on port ${PORT}`));
