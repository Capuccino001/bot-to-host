import axios from 'axios';

const config = {
    name: "gemini",
    aliases: ["bard"],
    description: "Ask a question to the Google Gemini.",
    usage: "[query]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "coffee",
};

const previousResponses = new Map(); // Store previous responses for each user

async function onCall({ message, args }) {
    const userQuery = args.join(" ");
    const userId = message.senderID; // Get user ID

    // Handle case where no query is provided
    if (!userQuery) {
        return message.reply("👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━");
    }

    // Check for previous response to handle follow-ups
    const previousResponse = previousResponses.get(userId);
    const query = previousResponse ? `Follow-up on: "${previousResponse}"\nUser reply: "${userQuery}"` : userQuery;

    await message.react("🕰️"); // Indicate processing

    try {
        const { data } = await axios.get(`https://deku-rest-api.gleeze.com/gemini`, {
            params: {
                prompt: query
            }
        });

        // Validate the response and respond accordingly
        if (data?.gemini) {
            previousResponses.set(userId, data.gemini); // Store the latest response
            await message.reply(`👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${data.gemini}\n━━━━━━━━━━━━━━━━`);
            await message.react("✔️"); // React with ✔️ on success
        } else {
            throw new Error("Unexpected response format from API");
        }
    } catch (error) {
        console.error("API call failed:", error);
        await message.react("✖️"); // React with ✖️ on error
        await message.reply("An error occurred while fetching the data."); // Error message
    }
}

export default {
    config,
    onCall,
};