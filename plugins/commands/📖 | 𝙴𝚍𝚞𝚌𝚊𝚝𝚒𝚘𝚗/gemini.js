const axios = require('axios');
const { sendMessage } = require('../handles/sendMessage');
const fs = require('fs');

const token = fs.readFileSync('token.txt', 'utf8');

module.exports = {
  name: 'gemini',
  description: 'Talk to Gemini AI',
  usage: '-gemini <question>',
  author: 'Your Name',
  async execute(senderId, args) {
    const pageAccessToken = token;

    // Set a default query if none is provided
    const query = args.join(" ") || "hi";

    try {
      const response = await axios.get(`https://nash-rest-api-production.up.railway.app/gemini-1.5-flash-latest?prompt=${query}`);
      const geminiResponse = response.data.response;

      await sendMessage(senderId, { text: geminiResponse }, pageAccessToken);
    } catch (error) {
      console.error('Error:', error);
      await sendMessage(senderId, { text: 'Error: Unexpected error.' }, pageAccessToken);
    }
  }
};
