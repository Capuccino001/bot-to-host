import fs from "fs";
import { join } from "path";

const config = {
    name: "delete",
    aliases: ["del"],
    description: "Delete files in the specified directory.",
    usage: "[filename]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const fileName = args.join(" ");

    if (!fileName) return message.reply("Please provide a filename to delete.");

    const directoryPath = "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜"; // Specified directory
    const filePath = join(directoryPath, fileName);

    await message.react("🕰️"); // Indicate processing

    try {
        if (!fs.existsSync(filePath)) {
            throw new Error("⚠️ File does not exist.");
        }

        fs.unlinkSync(filePath); // Delete the file
        await message.reply(`✅ Successfully deleted: ${fileName}`); // Success message
        await message.react("✔️"); // React with ✔️ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❌ on error
        await message.reply(`⚠️ An error occurred: ${error.message}`); // Error message
    }
}

export default {
    config,
    onCall,
};