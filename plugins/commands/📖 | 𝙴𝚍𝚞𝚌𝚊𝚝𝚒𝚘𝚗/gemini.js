const axios = require("axios");

const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Fetches a response from the Gemini AI.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Samir OE",
};

async function fetchFromAPI(url) {
    try {
        const response = await axios.get(url);
        return response;
    } catch (error) {
        console.error("Primary API failed:", error.message);
        for (const fallback of global.api.fallbacks) {
            try {
                const response = await axios.get(url.replace(global.api.s, fallback));
                return response;
            } catch (error) {
                console.error("Fallback API failed:", error.message);
            }
        }
        throw new Error("All APIs failed.");
    }
}

async function onCall({ message, args }) {
    const userQuery = args.join(" ").trim();

    if (!userQuery) return message.reply("Please provide a query.");

    await message.react("🕰️"); // Indicate processing

    const senderID = message.senderID;
    const query = `${userQuery}, short direct answer.`;
    const apiUrl = `${global.api.s}/gemini?text=${encodeURIComponent(query)}&system=default&uid=${senderID}`;

    try {
        const response = await fetchFromAPI(apiUrl);

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            throw new Error("No response from the AI.");
        }

        const responseText = response.data.candidates[0].content.parts[0].text.trim();
        const formattedMessage = `🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━\n${responseText}\n━━━━━━━━━━━━━━━━`;

        await message.reply(formattedMessage); // Send back the result
        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply("An error occurred while fetching the data."); // Error message
    }
}

export default {
    config,
    onCall,
};