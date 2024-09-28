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
    const { senderID: id, threadID } = message;

    if (!userQuery) {
        return message.reply(
            "👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\nHello! How can I assist you today?\n━━━━━━━━━━━━━━━━"
        );
    }

    let query = previousResponses.has(id)
        ? `Follow-up on: "${previousResponses.get(id)}"\nUser reply: "${userQuery}"`
        : userQuery;

    message.react("🕰️"); // Indicate processing

    try {
        const { data } = await axios.get(
            `https://deku-rest-api.gleeze.com/gemini?prompt=${encodeURIComponent(query)}`
        );

        if (data?.gemini) {
            previousResponses.set(id, data.gemini);
            await message.reply(
                `👩‍💻✨ | 𝙶𝚎𝚖𝚒𝚗𝚒\n━━━━━━━━━━━━━━━━\n${data.gemini}\n━━━━━━━━━━━━━━━━`
            );
            message.react("✔️"); // React with ✔️ on success
        } else {
            throw new Error("Unexpected response format from API");
        }
    } catch (error) {
        console.error("API call failed:", error);
        message.react("✖️"); // React with ✖️ on error
        message.reply("An error occurred while fetching the data."); // Error message
    }
}

export default {
    config,
    onCall,
};