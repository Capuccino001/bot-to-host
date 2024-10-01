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

// Function to fetch from the API with fallback to the next one
async function fetchWithFallback(query) {
    for (const url of apiUrls) {
        try {
            const response = await axios.get(`${url}${encodeURIComponent(query)}`, { timeout: 5000 });
            if (response.data && response.data.response) {
                return response.data.response; // Return valid response
            }
        } catch (error) {
            console.warn(`Error fetching from API: ${url}`, error); // Log the error and continue to the next API
        }
    }
    return null; // If all APIs fail, return null
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
        const validResponse = await fetchWithFallback(fullQuery);

        if (validResponse) {
            previousResponses.set(id, validResponse); // Store the latest response for follow-up
            await message.send(`${header}\n${validResponse}\n${footer}`); // Send the response back to the user with header and footer
        } else {
            await message.send(`${header}\nSorry, I couldn't get a valid response from any API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error during the request:", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};