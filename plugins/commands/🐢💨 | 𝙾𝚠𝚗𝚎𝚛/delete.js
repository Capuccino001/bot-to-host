import fs from "fs";
import { join } from "path";

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
];

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

    await message.react("🕰️"); // Indicate processing

    let fileDeleted = false;
    let foundFilePath = "";

    try {
        for (const directoryPath of directories) {
            const filePath = join(directoryPath, fileName);

            if (fs.existsSync(filePath)) {
                foundFilePath = filePath;
                fs.unlinkSync(filePath); // Delete the file
                fileDeleted = true;
                break;
            }
        }

        if (fileDeleted) {
            await message.reply(`✅ Successfully deleted: ${fileName} from ${foundFilePath}`); // Success message
            await message.react("✔️"); // React with ✔️ on success
        } else {
            throw new Error("⚠️ File does not exist in the specified directories.");
        }
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