const { callGeminiAPI } = require('../utils/callGeminiAPI');

module.exports = {
  name: 'gemini',
  description: 'Interact with Gemini AI.', 
  usage: '-gemini <question>',
  author: 'ChatGPT',

  async execute(senderId, args, pageAccessToken, sendMessage) {
    const prompt = args.join(' ');
    try {
      const response = await callGeminiAPI(prompt);

      // Prepare the full response with header and footer, and trim any extra spaces
      const header = 'ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・───────────・\n';
      const footer = '\n・───────────・';
      const fullResponse = `${header}${response.trim()}${footer}`;

      // Split the response into chunks if it exceeds 2000 characters
      const maxMessageLength = 2000 - header.length - footer.length; // Adjust for header/footer length
      if (fullResponse.length > 2000) {
        const messages = splitMessageIntoChunks(fullResponse, maxMessageLength);
        for (const message of messages) {
          sendMessage(senderId, { text: message }, pageAccessToken);
        }
      } else {
        sendMessage(senderId, { text: fullResponse }, pageAccessToken);
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      sendMessage(senderId, { text: '.' }, pageAccessToken);
    }
  }
};

function splitMessageIntoChunks(message, chunkSize) {
  const chunks = [];
  for (let i = 0; i < message.length; i += chunkSize) {
    chunks.push(message.slice(i, i + chunkSize));
  }
  return chunks;
}