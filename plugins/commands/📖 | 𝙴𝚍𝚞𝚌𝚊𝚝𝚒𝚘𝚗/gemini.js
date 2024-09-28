import axios from 'axios';

const config = {
    name: "gemini",
    aliases: ["bard"],
    description: "Ask a question to the Google Gemini.",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args }) {
    if (!args.length) {
        message.reply("👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒 \n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
        return;
    }

    let query = args.join(" ");
    const id = message.senderID;
    const previousResponse = previousResponses.get(id); // Get the previous response for the user

    // If there's a previous response, handle it as a follow-up
    if (previousResponse) {
        query = `Follow-up on: "${previousResponse}"\nUser reply: "${query}"`;
    }

    try {
        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query
        const response = await axios.get(`https://deku-rest-api.gleeze.com/gemini?prompt=${encodeURIComponent(query)}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Extract the reply from the response
        if (response.data && response.data.gemini) {
            const geminiResponse = response.data.gemini;
            await message.send(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${geminiResponse}\n━━━━━━━━━━━━━━━━`);

            // Store the response for follow-up
            previousResponses.set(id, geminiResponse);
        } else {
            await message.send("👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nError: Unexpected response format from API.\n━━━━━━━━━━━━━━━━");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        message.react(`❎`);
    }
}

export default {
    config,
    onCall
};