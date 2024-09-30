import fs from "fs";
import path from "path";

const config = {
    name: "cmd",
    aliases: ["cmd"],
    description: "Creates a new file in the specified category or replaces content if the file exists",
    usage: "install [file name] [content]",
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
    const fileContent = args.slice(2).join(" "); // content for the file

    // Ensure the first argument is 'install'
    if (action !== "install") {
        return message.send("Please use the correct syntax: `cmd install <file name> <content>`.");
    }

    if (!fileName) {
        return message.send("Please provide a valid file name.");
    }

    if (!fileContent) {
        return message.send("Please provide content to put inside the file.");
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

export default {
    config,
    onCall,
};
