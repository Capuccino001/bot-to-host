import samirapi from 'samirapi';

const config = {
    name: "copilot",
    aliases: ["bing"],
    description: "Query Bing Copilot AI for answers.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

// Define the header and footer
const header = `🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━`;
const footer = `━━━━━━━━━━━━━━━━`;

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        // Reply with header, error message, and footer
        return await message.reply(`${header}\n✖️ Please provide a query for Bing Copilot.\n${footer}`);
    }

    const query = args.join(" ");

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);

        // Bing Copilot AI query
        const response = await samirapi.bing({ message: query, mode: "creative", uid: userId });

        stopTypingIndicator();

        console.log("Bing Copilot AI response: ", response);

        if (response) {
            // Send the response with the header and footer
            await message.send(`${header}\n${response}\n${footer}`);
            await message.react("✔️");
        } else {
            await message.send(`${header}\n⚠️ No response received from Bing Copilot AI.\n${footer}`);
        }
    } catch (error) {
        console.error("Bing Copilot AI query failed: ", error);
        await message.react("✖️");
        // Send the error message with the header and footer
        await message.send(`${header}\n⚠️ Sorry, I couldn't process your query. Please try again later.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};