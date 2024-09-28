import samirapi from 'samirapi';

const config = {
    name: "exampleCommand",
    aliases: ["example"],
    description: "Description of the example command.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("❌ Please provide a query to execute the command.");
    }

    const query = args.join(" ");

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const response = await samirapi.exampleAPI(query, userId);

        stopTypingIndicator();

        console.log("API response: ", response);

        if (response) {
            await message.send(response);
            await message.react("✅");
        } else {
            await message.send("⚠️ No response received from the API.");
        }
    } catch (error) {
        console.error("API call failed: ", error);
        await message.react("❎");
        await message.send("⚠️ Sorry, I couldn't execute the command. Please try again later.");
    }
}

export default {
    config,
    onCall,
};