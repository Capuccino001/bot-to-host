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

// List of APIs
const apiUrls = [
    "https://samirxpikachuio.onrender.com/gpt4mini?prompt=",
    "https://www.samirxpikachu.run" + ".place/gpt4mini?prompt=", // Separated URL for the second API
    "http://samirxzy.onrender.com/gpt4mini?prompt="
];

// Function to fetch from the fastest API
async function fetchFromFastestAPI(query) {
    const promises = apiUrls.map(url => 
        axios.get(`${url}${encodeURIComponent(query)}`, { timeout: 5000 }) // Set a timeout of 5 seconds for each request
            .then(response => ({ data: response.data, url })) 
            .catch(() => null) // Catch any errors to prevent one failing request from affecting others
    );

    const results = await Promise.all(promises);
    return results.find(result => result !== null); // Return the first successful result
}

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
        const result = await fetchFromFastestAPI(fullQuery);

        if (result && result.data.response) {
            previousResponses.set(id, result.data.response); // Store the latest response for follow-up
            await message.send(`${header}\n${result.data.response}\n${footer}`); // Send the response back to the user with header and footer
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