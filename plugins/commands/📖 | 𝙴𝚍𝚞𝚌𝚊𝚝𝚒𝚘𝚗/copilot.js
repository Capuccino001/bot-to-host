import axios from 'axios';

const config = {
    name: "copilot",
    aliases: ["bing"],
    description: "Ask a question to the Bing Copilot",
    usage: "[query]",
    category: "𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    cooldown: 3,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "RN",
};

const previousResponses = new Map(); // Map to store previous responses for each user

async function onCall({ message, args }) {
    const userId = message.senderID; // User ID

    let userQuery;

    // Check if no query is provided and assume "hi"
    if (!args.length) {
        userQuery = "hi"; // Set default query to "hi"
    } else {
        userQuery = args.join(" "); // Join args if there is a query
    }

    const previousResponse = previousResponses.get(userId); // Get the previous response for the user

    // Handle follow-up queries
    const query = previousResponse 
        ? `Follow-up on: "${previousResponse}"\nUser reply: "${userQuery}"`
        : userQuery;

    await message.react("🕰️"); // Indicate processing

    try {
        const typingIndicator = global.api.sendTypingIndicator(message.threadID); // Start typing indicator

        // Send request to the API with the query
        const response = await axios.get(`https://samirxpikachuio.onrender.com/bing`, {
            params: {
                message: query, // The query message
                mode: 1, // Set mode (you can adjust this based on your requirements)
                uid: userId // The user ID
            }
        });

        typingIndicator(); // Stop typing indicator

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Extract the response directly from the API response
        const copilotResponse = response.data; // Update if the structure is different

        // Log the message being sent for debugging
        console.log(`Sending message: ${copilotResponse}`);

        // Send the extracted message to the user
        await message.send(`🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n${copilotResponse}\n━━━━━━━━━━━━━━━━`);

        // Store the response for follow-up
        previousResponses.set(userId, copilotResponse);
        await message.react("✔️"); // React with ✔️ on success
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);
        await message.react("✖️"); // React with ✖️ on error
        await message.send("❌ | An error occurred while trying to reach the Bing Copilot."); // Error message
    }
}

export default {
    config,
    onCall
};