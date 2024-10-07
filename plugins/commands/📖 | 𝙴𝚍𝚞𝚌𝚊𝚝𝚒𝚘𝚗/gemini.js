import samirapi from 'samirapi';
import axios from 'axios';

const config = {
    name: "gemini",
    aliases: ["askgemini"],
    description: "Interacts with the Gemini AI model.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\nHello! How can I assist you today?\n・───── >ᴗ< ──────・");
    }

    const query = args.join(" ");

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
            const response = await samirapi.gemini(query, userId);

            stopTypingIndicator();

            console.log("Gemini response: ", response);

            if (response) {
                await message.reply(`ᯓ★ | 𝙶𝚎𝚖𝚒𝚗𝚒\n・──────────────・\n${response}\n・───── >ᴗ< ──────・`);
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
