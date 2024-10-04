import fs from "fs";
import path from "path";
import samirapi from 'samirapi';

const config = {
    name: "nekobin",
    aliases: ["nekocode"],
    description: "Fetch the contents of a command file from the commands directory and upload it to Nekobin.",
    usage: "[file name]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "XaviaTeam & Coffee",
};

// Root directory for commands
const commandRootDir = path.resolve('./plugins/commands');

// Function to search for a file in all subdirectories
function findFileInDirectories(directory, fileName) {
    const filesAndDirs = fs.readdirSync(directory, { withFileTypes: true });

    for (const entry of filesAndDirs) {
        const entryPath = path.join(directory, entry.name);
        
        if (entry.isDirectory()) {
            // Recursively search in subdirectories
            const result = findFileInDirectories(entryPath, fileName);
            if (result) return result;
        } else if (entry.isFile() && entry.name === `${fileName}.js`) {
            // Return the full path if the file is found
            return entryPath;
        }
    }
    return null;
}

async function onCall({ message, args, event }) {
    const fileName = args.join(" ");
    if (!fileName) {
        return message.send("✖️ Please provide a file name.");
    }

    // Search for the file in the root directory and subdirectories
    const filePath = findFileInDirectories(commandRootDir, fileName);

    if (!filePath) {
        return message.send("✖️ File not found in the commands directory!");
    }

    // If file is found, read its content
    let fileContent;
    try {
        fileContent = fs.readFileSync(filePath, "utf8");
    } catch (error) {
        return message.send(`⚠️ Failed to read the file content: ${error.message}`);
    }

    // Upload file content to Nekobin
    try {
        await message.react("🕰️");  // Indicate that the bot is processing
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const response = await samirapi.nekobin(fileContent);  // Upload the content to Nekobin

        stopTypingIndicator();

        // Check if the upload was successful and send the URL
        if (response && response.success && response.url) {
            const nekobinUrl = response.url;

            // Send the Nekobin URL to the chat
            await message.send(`📝 Code uploaded: ${nekobinUrl}`);
            await message.react("✔️");
        } else {
            await message.send(`⚠️ Failed to upload to Nekobin. Response: ${JSON.stringify(response)}`);
        }
    } catch (error) {
        // Send the actual error message to the chat
        await message.send(`⚠️ Sorry, I couldn't upload the file content: ${error.message}`);
    }
}

export default {
    config,
    onCall
};