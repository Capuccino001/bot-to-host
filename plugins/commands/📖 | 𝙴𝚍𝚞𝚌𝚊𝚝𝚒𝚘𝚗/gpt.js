import axios from 'axios';

const config = {
    name: "gpt",
    aliases: ["chatgpt"],
    description: "Ask a question to the GPT.",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "RN",
};

async function onCall({ message, args, replyHandler }) {
    let query;
    const uid = message.senderID; // Using senderID as uid

    // Check if the message is a reply to the bot's message with a specific header
    if (replyHandler?.isReplyToBot && replyHandler?.header === 'ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃') {
        // If the message is a reply, extract the query from the reply
        query = message.body;
    } else {
        // Handle case where no query is provided
        if (!args.length) {
            return message.reply("ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\nHello! How can I assist you today?\n・───── >ᴗ< ──────・");
        }
        query = args.join(" ");
    }

    // Indicate processing
    const typingIndicator = global.api.sendTypingIndicator(message.threadID);

    try {
        // Send request to the new API
        const { data } = await axios.get(`https://markdevs-last-api.onrender.com/gpt4`, {
            params: {
                prompt: query,
                uid: uid
            }
        });

        typingIndicator(); // Stop the typing indicator

        // Validate the response
        if (data?.gpt4) {
            await message.reply(`ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\n${data.gpt4}\n・───── >ᴗ< ──────・`);
        } else {
            await message.reply("ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\nError: Unexpected response format from API.\n・───── >ᴗ< ──────・");
        }
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        await message.react(`✖️`);
        await message.reply("An error occurred while fetching the data."); // Inform the user about the error
    }
}

export default {
    config,
    onCall
};