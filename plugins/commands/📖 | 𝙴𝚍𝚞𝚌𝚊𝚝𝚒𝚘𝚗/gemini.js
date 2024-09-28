import axios from 'axios';

const config = {
    name: "gemini",
    aliases: ["gemini"],
    description: "Interact with the Gemini AI model.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userQuery = args.join(" ");

    if (!userQuery) return message.reply("Please provide a query.");

    await message.react("🕰️"); // Indicate processing

    const apiUrl = 'https://free-ai-models.vercel.app/v1/chat/completions';
    const requestBody = {
        model: 'gemini-1.5-pro-latest', // Modify the model if needed
        messages: [
            { role: 'system', content: '' }, // System message, can be left blank or customized
            { role: 'user', content: userQuery } // User query from the message
        ]
    };

    try {
        const response = await axios.post(apiUrl, requestBody);

        if (!response.data) throw new Error("No data returned from API");

        const { choices } = response.data;
        const result = choices?.[0]?.message?.content || "Sorry, I couldn't find a response.";

        await message.reply(result); // Send back the AI's response
        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        await message.react("❎"); // React with ❎ on error
        await message.reply("An error occurred while interacting with the AI."); // Error message
    }
}

export default {
    config,
    onCall,
};