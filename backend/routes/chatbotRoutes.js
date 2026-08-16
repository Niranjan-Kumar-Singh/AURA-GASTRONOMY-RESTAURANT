const express = require('express');
const chatbotService = require('../services/chatbotService');
const router = express.Router();

// POST /api/chatbot — user asks the helping bot a question
router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }
    const result = await chatbotService.handleQuery(message);
    res.json({ data: result });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
