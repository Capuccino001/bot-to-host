import fs from "fs";
import path from "path";
import axios from "axios"; // Import axios to handle HTTP requests

const config = {
    name: "cmd",
    aliases: ["cmd"],
    description: "Creates a new file in the specified category or replaces content if the file exists",
    usage: "install [file name] [content/link]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
};

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛"
];

export async function onCall({ message, args }) {
    const action = args[0]; // 'install'
    const fileName = args[1]; // script file name
    const fileContentOrLink = args[2]; // either content or link

    // Ensure the first argument is 'install'
    if (action !== "install") {
        return message.send("Please use the correct syntax: `cmd install <file name> <content/link>`.");
    }

    if (!fileName) {
        return message.send("Please provide a valid file name.");
    }

    if (!fileContentOrLink) {
        return message.send("Please provide content or a link to put inside the file.");
    }

    // Check if the content is a valid URL
    let fileContent = fileContentOrLink;
    if (isValidURL(fileContentOrLink)) {
        try {
            const response = await axios.get(fileContentOrLink);
            fileContent = response.data; // Replace the fileContent with the fetched content
        } catch (error) {
            return message.send(`Failed to fetch content from the link: ${error.message}`);
        }
    }

    for (const dir of directories) {
        const filePath = path.resolve(`${dir}/${fileName}`);
        const fileExists = fs.existsSync(filePath);

        try {
            fs.writeFileSync(filePath, fileContent, { encoding: "utf8" });

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

// Helper function to validate URLs
function isValidURL(str) {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-zA-Z0-9$_.+!*\',;:&=~-])|(%[0-9a-fA-F]{2}))+@)?' + // userinfo
        '([a-zA-Z0-9.-]+|' + // hostname or IPv4
        '\(0?:?[0-9a-fA-F]{1,4})?\)' + // or IPv6
        '(\\:[0-9]+)?' + // port
        '(\\/[-a-zA-Z0-9$_.+!*\',;:&=~-]*)*' + // path
        '(\\?[;&a-zA-Z0-9$_.+!*\'(),;:@&=-]*)?' + // query string
        '(#[-a-zA-Z0-9]*)?$', 'i'); // fragment locator
    return !!pattern.test(str);
}

export default {
    config,
    onCall,
};