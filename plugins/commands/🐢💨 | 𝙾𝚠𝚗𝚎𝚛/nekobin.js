import samirapi from 'samirapi';
import fs from 'fs';
import path from 'path';

const config = {
    name: "nekobin",
    aliases: ["nekocode"],
    description: "Uploads the content of a file to Nekobin and returns the URL.",
    usage: "[file name]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

const commandRootDir = path.resolve('./plugins/commands'); // The root directory for commands

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("✖️ Please provide a file name to upload.");
    }

    const fileName = args.join(" ");
    const filePath = path.join(commandRootDir, fileName);

    // Check if the file exists in the command directory
    if (!fs.existsSync(filePath)) {
        return await message.reply(`⚠️ The file "${fileName}" does not exist in the command directory.`);
    }

    try {
        await message.react("🕰️");

        // Read the file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);

        // Upload content to Nekobin
        const response = await samirapi.nekobin(fileContent);

        stopTypingIndicator();

        // Check if response contains the URL
        if (response && response.success && response.url) {
            const nekobinUrl = response.url;
            console.log("Nekobin URL: ", nekobinUrl);

            // Send the Nekobin URL back to the user
            await message.send(`📝 File content uploaded: ${nekobinUrl}`);
            await message.react("✔️");
        } else {
            await message.send("⚠️ No valid URL received from Nekobin.");
        }
    } catch (error) {
        console.error("Nekobin upload failed: ", error);
        await message.react("✔️");
        await message.send("⚠️ Sorry, I couldn't upload the file content. Please try again later.");
    }
}

export default {
    config,
    onCall,
};