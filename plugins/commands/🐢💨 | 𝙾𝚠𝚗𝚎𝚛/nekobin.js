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

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
]; // Change your directory path based on folder names

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("✖️ Please provide a file name to upload.");
    }

    const fileName = args.join(" ");
    let filePath = null;

    // Loop through directories to find the file
    for (const dir of directories) {
        const potentialPath = path.join(process.cwd(), dir, fileName); // Construct the full path

        if (fs.existsSync(potentialPath)) {
            filePath = potentialPath;
            break; // Exit loop once the file is found
        }
    }

    // If filePath is still null, the file was not found in any directory
    if (!filePath) {
        return await message.reply(`⚠️ The file "${fileName}" does not exist in any specified directory.`);
    }

    try {
        await message.react("🕰️");

        // Read the file content
        const fileContent = fs.readFileSync(filePath, 'utf-8');

        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);

        // Upload content to Nekobin
        const response = await samirapi.nekobin(fileContent);

        stopTypingIndicator();

        // Check if response contains a valid URL
        if (response?.success && response?.url) {
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