import samirapi from 'samirapi';

const config = {
    name: "nekobin",
    aliases: ["nekocode"],
    description: "Uploads provided code to Nekobin and returns the URL.",
    usage: "[code]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("✖️ Please provide code to upload.");
    }

    const code = args.join(" ");

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const nekobinUrl = await samirapi.nekobin(code);

        stopTypingIndicator();

        console.log("Nekobin URL: ", nekobinUrl);

        if (nekobinUrl) {
            await message.send(`📝 Code uploaded: ${nekobinUrl}`);
            await message.react("✔️");
        } else {
            await message.send("⚠️ No response received from Nekobin.");
        }
    } catch (error) {
        console.error("Nekobin upload failed: ", error);
        await message.react("✔️");
        await message.send("⚠️ Sorry, I couldn't upload the code. Please try again later.");
    }
}

export default {
    config,
    onCall,
};