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
        const response = await samirapi.nekobin(code); // Nekobin API call

        stopTypingIndicator();

        // Check if response has a success flag and URL
        if (response && response.success && response.url) {
            const nekobinUrl = response.url;
            console.log("Nekobin URL: ", nekobinUrl);

            // Send the Nekobin URL back to the user
            await message.send(`📝 Code uploaded: ${nekobinUrl}`);
            await message.react("✔️");
        } else {
            await message.send("⚠️ No valid URL received from Nekobin.");
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