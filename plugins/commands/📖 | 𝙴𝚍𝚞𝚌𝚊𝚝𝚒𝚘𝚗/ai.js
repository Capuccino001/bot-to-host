import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"], // name and alias are the same
    description: "Interact with the GPT-4 API",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

// Object to store users' queries
const userQueries = {};

async function onCall({ message, args }) {
    const userId = message.senderID; // Use the sender's ID to track requests
    const query = args.join(" ") || "hi"; // Use the user's query or default to "hi"

    const header = "🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━";
    const footer = "━━━━━━━━━━━━━━━━";

    // Store the user's query or combine it with their previous one
    if (userQueries[userId]) {
        userQueries[userId] = `${userQueries[userId]} ${query}`;
    } else {
        userQueries[userId] = query;
    }

    try {
        // Make the GET request to the API with the combined query
        const { data } = await axios.get(`https://orc-six.vercel.app/gpt4?ask=${encodeURIComponent(userQueries[userId])}`);

        // Clear the stored query after making the request
        delete userQueries[userId];

        // Since the response is plain text, just send it as is
        if (data) {
            await message.send(`${header}\n${data}\n${footer}`); // Send the response with header and footer
        } else {
            await message.send(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error fetching from GPT-4 API:", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};