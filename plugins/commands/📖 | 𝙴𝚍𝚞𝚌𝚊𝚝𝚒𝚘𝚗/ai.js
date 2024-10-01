import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"], // name and alias are the same
    description: "Interact with the GPT-4 Mini API",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args }) {
    const id = message.senderID; // User ID
    const query = args.join(" ") || "hi"; // Use the user's query or default to "hi"
    const previousResponse = previousResponses.get(id); // Get the previous response for the user

    // If there's a previous response, handle it as a follow-up
    const fullQuery = previousResponse 
        ? `Follow-up on: "${previousResponse}"\nUser reply: "${query}"` 
        : query;

    const header = "🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━";
    const footer = "━━━━━━━━━━━━━━━━";

    try {
        const response = await fetch(`https://samirxpikachuio.onrender.com/gpt4mini?prompt=${encodeURIComponent(fullQuery)}`);
        const data = await response.json();

        if (data.response) {
            previousResponses.set(id, data.response); // Store the latest response for follow-up
            await message.send(`${header}\n${data.response}\n${footer}`); // Send the response back to the user with header and footer
        } else {
            await message.send(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error fetching from GPT-4 Mini API:", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};
