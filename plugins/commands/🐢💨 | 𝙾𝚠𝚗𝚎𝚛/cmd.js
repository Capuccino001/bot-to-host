import fs from "fs";
import path from "path";
import axios from "axios";

const config = {
    name: "cmd",
    aliases: ["cmd"],
    description: "Creates a new file in the specified category or replaces content if the file exists.",
    usage: "install [file name] [content/link]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "coffee",
};

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
]; // change your directory paths if needed.

/**
 * Note on file Installation:
 * - The script will try to save your file in a list of folders one by one.
 * - If the file doesn't exist, it will create a new file in the first folder.
 * - If the file already exists in any folder, it will change the old file's content to the new content.
 * - If it can't save the file in any folder, it will let you know there was a problem.
 */

export async function onCall({ message, args }) {
    const action = args[0]; // 'install'
    const fileName = args[1]; // script file name
    const fileContent = args[2]; // content or URL for the file

    // Ensure the first argument is 'install'
    if (action !== "install") {
        return message.send("Please use the correct syntax: `cmd install <file name> <content/link>`.");
    }

    if (!fileName) {
        return message.send("Please provide a valid file name.");
    }

    if (!fileContent) {
        return message.send("Please provide content or a link to put inside the file.");
    }

    let contentToWrite;

    // Check if fileContent is a URL and fetch its content
    if (fileContent.startsWith("http://") || fileContent.startsWith("https://")) {
        try {
            const response = await axios.get(fileContent);
            contentToWrite = response.data; // Get the content from the URL
        } catch (error) {
            return message.send(`Error fetching content from the URL: ${error.message}`);
        }
    } else {
        contentToWrite = fileContent; // Use the provided content directly.
    }

    for (const dir of directories) {
        const filePath = path.resolve(`${dir}/${fileName}`);
        const fileExists = fs.existsSync(filePath);

        try {
            fs.writeFileSync(filePath, contentToWrite, { encoding: "utf8" });

            // Check if the file already existed
            if (fileExists) {
                return message.send(`File ${fileName} already existed. Content has been replaced.`);
            } else {
                return message.send(`File ${fileName} created successfully in ${dir}`);
            }
        } catch (error) {
            return message.send(`Error creating or replacing file content: ${error.message}`);
        }
    }

    // If none of the directories worked, send an error message
    return message.send("⚠️ Could not create or replace the file in any category.");
}

export default {
    config,
    onCall,
};