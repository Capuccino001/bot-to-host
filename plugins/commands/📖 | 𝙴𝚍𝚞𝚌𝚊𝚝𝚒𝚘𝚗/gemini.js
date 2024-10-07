import axios from 'axios';

const config = {
    name: "gemini",
    aliases: ["askgemini"],
    description: "Interacts with the Gemini AI model.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    // Default the query to "hi" if no arguments are provided
    const query = args.join(" ") || "hi";

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);

        if (message.messageReply && message.messageReply.attachments && message.messageReply.attachments[0]?.type === "photo") {
            const attachment = message.messageReply.attachments[0];
            const imageURL = attachment.url;

            const geminiUrl = `https://joncll.serv00.net/chat.php?ask=${encodeURIComponent(query)}&imgurl=${encodeURIComponent(imageURL)}`;
            const geminiResponse = await axios.get(geminiUrl);
            const { vision } = geminiResponse.data;

            stopTypingIndicator();

            if (vision) {
                await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n${vision}\n・───── >ᴗ< ──────・`);
                await message.react("✔️");
            } else {
                await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\nFailed to recognize the image.\n・───── >ᴗ< ──────・`);
            }
        } else {
            const geminiUrl = `https://joncll.serv00.net/chat.php?ask=${encodeURIComponent(query)}`;
            const geminiResponse = await axios.get(geminiUrl);
            const { textResponse } = geminiResponse.data;

            stopTypingIndicator();

            if (textResponse) {
                await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n${textResponse}\n・───── >ᴗ< ──────・`);
                await message.react("✔️");
            } else {
                await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n⚠️ No response received from Gemini.\n・───── >ᴗ< ──────・`);
            }
        }
    } catch (error) {
        console.error("Gemini API call failed: ", error);
        await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n⚠️ Sorry, I couldn't execute the command. Please try again later.\n・───── >ᴗ< ──────・`);
    }
}

export default {
    config,
    onCall,
};