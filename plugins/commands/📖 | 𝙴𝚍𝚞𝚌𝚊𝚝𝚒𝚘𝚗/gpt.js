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

// Define the specific header to check
const SPECIFIC_HEADER = "ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃";

async function replyHandler({ eventData, message }) {
    const { body, senderID, reply_message } = message;

    // Ignore the reply if it is not to a bot's message with the specific header
    if (!reply_message || !reply_message.body.startsWith(SPECIFIC_HEADER)) {
        return; // Ignore without any response
    }

    const query = body.trim(); // Use the reply content as the new query

    if (!query) {
        return message.reply("Please provide a question.");
    }

    const uid = senderID;

    try {
        const { data } = await axios.get(`https://markdevs-last-api.onrender.com/gpt4`, {
            params: {
                prompt: query,
                uid: uid
            }
        });

        // Validate the response
        if (data?.gpt4) {
            await message.reply(`ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\n${data.gpt4}\n・───── >ᴗ< ──────・`);
        } else {
            await message.reply("ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\nError: Unexpected response format from API.\n・───── >ᴗ< ──────・");
        }
    } catch (error) {
        console.error('Error during API call:', error);
        await message.react("✖️");
    }
}

async function onCall({ message, args }) {
    const uid = message.senderID;
    
    let query;
    if (args.length) {
        query = args.join(" ");
    } else {
        return message.reply("ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\nHello! How can I assist you today?\n・───── >ᴗ< ──────・");
    }

    // Indicate typing status
    const typingIndicator = global.api.sendTypingIndicator(message.threadID);

    try {
        // Call the GPT-4 API
        const { data } = await axios.get(`https://markdevs-last-api.onrender.com/gpt4`, {
            params: {
                prompt: query,
                uid: uid
            }
        });

        typingIndicator(); // Stop typing indicator

        if (data?.gpt4) {
            await message.reply(`ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\n${data.gpt4}\n・───── >ᴗ< ──────・`).then(msg => {
                // Attach a reply event for follow-up queries
                msg.addReplyEvent({
                    callback: replyHandler,
                    type: "message", // Set event type
                });
            });
        } else {
            await message.reply("ᝰ.ᐟ | 𝙲𝚑𝚊𝚝𝙶𝙿𝚃\n・──────────────・\nError: Unexpected response format from API.\n・───── >ᴗ< ──────・");
        }
    } catch (error) {
        console.error("Error during API call:", error);
        await message.react("✖️");
        await message.reply("An error occurred while fetching the data.");
    }
}

export default {
    config,
    onCall,
};