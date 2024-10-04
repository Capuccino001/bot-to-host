import fs from "fs";
import path from "path";
import samirapi from 'samirapi';

const config = {
    name: "nekobin",
    aliases: ["nekocode"],
    description: "Fetch the contents of a file and upload it to Nekobin.",
    usage: "[file name]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "XaviaTeam & Coffee",
};

// Specify your directories
const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
];

async function onCall({ message, args, event }) {
    const fileName = args.join(" ");
    if (!fileName) {
        return message.send("✖️ Please provide a file name.");
    }

    let fileContent;

    // Search for the file in the specified directories
    for (const dir of directories) {
        try {
            const filePath = path.resolve(`${dir}/${fileName}.js`);
            fileContent = fs.readFileSync(filePath, "utf8");
            break;
        } catch (error) {
            // Continue to next directory if file is not found
        }
    }

    if (!fileContent) {
        return message.send("✖️ File not found in any category!");
    }

    // If file content is found, upload to Nekobin
    try {
        await message.react("🕰️");  // Show that the bot is processing
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const response = await samirapi.nekobin(fileContent);  // Upload file content to Nekobin

        stopTypingIndicator();

        // Check if the upload was successful and return the URL
        if (response && response.success && response.url) {
            const nekobinUrl = response.url;
            console.log("Nekobin URL: ", nekobinUrl);

            // Send the Nekobin URL to the chat
            await message.send(`📝 Code uploaded: ${nekobinUrl}`);
            await message.react("✔️");
        } else {
            await message.send("⚠️ Failed to upload to Nekobin.");
        }
    } catch (error) {
        console.error("Nekobin upload failed: ", error);
        await message.react("✔️");
        await message.send("⚠️ Sorry, I couldn't upload the file content. Please try again later.");
    }
}

export default {
    config,
    onCall
};