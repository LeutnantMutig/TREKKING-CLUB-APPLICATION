const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// ✅ Initialize Gemini API
const genAI = new GoogleGenerativeAI(""); // Replace with your own key

// ✅ Format Gemini response to readable HTML
function convertMarkdownToHTML(text) {
  if (!text) return "";

  text = text.replace(/\*{3}/g, ''); // remove ***
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'); // bold
  text = text.replace(/(\d+\.\s)/g, '<br><br>$1'); // numbered list
  text = text.replace(/(\*\s)/g, '<br><br>$1'); // bullet list
  text = text.replace(/\. (?=[A-Z])/g, '.<br><br>'); // paragraph spacing

  return text;
}

// ✅ POST /chat route
router.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || userMessage.trim() === "") {
    return res.status(400).json({ reply: "Message is required." });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent(userMessage);
    const response = result.response;

    if (!response || typeof response.text !== 'function') {
      return res.status(500).json({ reply: "Unexpected response from Gemini API." });
    }

    const rawReply = response.text();
    const formattedReply = convertMarkdownToHTML(rawReply);

    res.json({ reply: formattedReply });

  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ reply: "Something went wrong with Gemini AI." });
  }
});

module.exports = router;
