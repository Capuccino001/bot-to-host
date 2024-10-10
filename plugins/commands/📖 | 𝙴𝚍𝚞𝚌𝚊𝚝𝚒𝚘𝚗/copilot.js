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

async function onCall({ message, args }) {
    const id = message.senderID;
    const query = args.join(" ") || "hi"; // Default to "hi" if no query is provided

    try {
        // React with a loading icon
        await message.react('🕰️');

        const typ = global.api.sendTypingIndicator(message.threadID);

        // Send request to the API with the query
        const response = await axios.get(`https://www.samirxpikachu.run.place/bing?message=${encodeURIComponent(query)}&mode=1&uid=${id}`);

        typ();

        // Log the response to check its structure
        console.log("API response: ", response.data);

        // Directly use the response data assuming it's at the top level
        const copilotResponse = response.data;

        // Additional logging for debugging purposes
        console.log(`Sending message: ${copilotResponse}`);

        // Send the extracted message to the user with the updated header and footer
        await message.send(`✧₊⁺ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n・──────────────・\n${copilotResponse}\n・───── >ᴗ< ──────・`);

        // React with success icon after successful response
        await message.react('✔️');
    } catch (error) {
        // Log the error for debugging
        console.error("API call failed: ", error);

        // Send failure message
        await message.send("✧₊⁺ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n・──────────────・\n⚠️ Sorry, I couldn't execute the command. Please try again later.\n・───── >ᴗ< ──────・");

        // React with failed icon
        await message.react('✖️');
    }
}

export default {
    config,
    onCall
};