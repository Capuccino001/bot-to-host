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

const previousResponses = new Map();

async function onCall({ message, args }) {
    const userQuery = args.join(" ");
    const userId = message.senderID;

    if (!userQuery) {
        return message.reply("ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\nHello! How can I assist you today?\n・───── >ᴗ< ──────・");
    }

    const previousResponse = previousResponses.get(userId);
    const query = previousResponse ? `Follow-up on: "${previousResponse}"\nUser reply: "${userQuery}"` : userQuery;

    await message.react("🕰️");

    try {
        if (message.messageReply && message.messageReply.attachments && message.messageReply.attachments[0]?.type === "photo") {
            const attachment = message.messageReply.attachments[0];
            const imageURL = attachment.url;

            const geminiUrl = `https://joncll.serv00.net/chat.php?ask=${encodeURIComponent(query)}&imgurl=${encodeURIComponent(imageURL)}`;
            const geminiResponse = await axios.get(geminiUrl);
            const { vision } = geminiResponse.data;

            if (vision) {
                return message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n${vision}\n・───── >ᴗ< ──────・`);
            } else {
                return message.reply(" Failed to recognize the image.");
            }
        }

        const { data } = await axios.get(`https://deku-rest-api.gleeze.com/gemini`, {
            params: {
                prompt: query
            }
        });

        if (data?.gemini) {
            previousResponses.set(userId, data.gemini);
            await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n${data.gemini}\n・───── >ᴗ< ──────・`);
            await message.react("✔️");
        } else {
            throw new Error("Unexpected response format from API");
        }
    } catch (error) {
        console.error("API call failed:", error);
        await message.react("✖️");
        await message.reply(" An error occurred while fetching the data.");
    }
}

export default {
    config,
    onCall,
};