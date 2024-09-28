import axios from 'axios';

const config = {
    name: "copilot",
    aliases: ["bing"],
    description: "Ask a question to the Bing Copilot",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

const previousResponses = new Map();

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.send(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\nHello! How can I help you today? 😊\n━━━━━━━━━━━━━━━━`
        );
    }

    const userQuery = args.join(" ");
    const previousResponse = previousResponses.get(userId);

    const query = previousResponse 
        ? `Follow-up on: "${previousResponse}"\nUser reply: "${userQuery}"`
        : userQuery;

    await message.react("🕰️");

    try {
        const typingIndicator = global.api.sendTypingIndicator(message.threadID);

        const response = await axios.get(`https://samirxpikachuio.onrender.com/bing`, {
            params: {
                message: query,
                mode: 1,
                uid: userId
            }
        });

        typingIndicator();

        const copilotResponse = response.data;

        await message.send(`🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n${copilotResponse}\n━━━━━━━━━━━━━━━━`);

        previousResponses.set(userId, copilotResponse);
        await message.react("✔️");
    } catch (error) {
        console.error("API call failed: ", error);
        await message.react("✖️");
        await message.send("❌ | An error occurred while trying to reach the Bing Copilot.");
    }
}

export default {
    config,
    onCall
};