import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"],
    description: "Interact with the GPT-4 API or analyze images",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ") || "hi";
    const userId = message.senderID; // Get user ID from message

    const header = "(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠) | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n・──────────────・";
    const footer = "・───── >ᴗ< ──────・";

    // Check for image attachments in the original message
    if (message.messageReply && message.messageReply.attachments && message.messageReply.attachments[0]?.type === "photo") {
        const attachment = message.messageReply.attachments[0];
        const imageURL = attachment.url;

        const geminiUrl = `https://deku-rest-apis.ooguy.com/gemini?prompt=describe%20this%20photo&url=${encodeURIComponent(imageURL)}`;
        try {
            const response = await axios.get(geminiUrl);
            const { gemini } = response.data;

            if (gemini) {
                return await message.reply(`${header}\n${gemini}\n${footer}`);
            } else {
                return await message.reply(`${header}\nFailed to recognize the image.\n${footer}`);
            }
        } catch (error) {
            console.error("Error fetching image recognition:", error);
            return await message.reply(`${header}\nAn error occurred while processing the image.\n${footer}`);
        }
    }

    // Handle text queries using the new API
    try {
        const apiUrl = `https://nash-rest-api-production.up.railway.app/Mixtral?userId=${userId}&message=${encodeURIComponent(query)}`;
        const { data } = await axios.get(apiUrl);

        if (data && data.response) {
            await message.reply(`${header}\n${data.response}\n${footer}`);
        } else {
            await message.reply(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error fetching from the new API:", error);
        await message.reply(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};
