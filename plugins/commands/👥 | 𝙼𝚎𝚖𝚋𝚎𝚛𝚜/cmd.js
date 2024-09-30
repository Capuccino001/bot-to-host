import fs from "fs";
import path from "path";

const config = {
    name: "cmd",
    aliases: ["cmd"],
    description: "Creates a new file in the specified category or replaces content if the file exists",
    usage: "[file name] [content]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
};

const directories = [
    "plugins/commands"
];

export async function onCall({ message, args }) {
    const fileName = args[0]; // Get the file name from the first argument
    const fileContent = args.slice(1).join(" "); // Join the rest of the arguments as content

    if (!fileName) {
        return message.reply("Please provide a valid file name.");
    }

    if (!fileContent) {
        return message.reply("Please provide content to put inside the file.");
    }

    for (const dir of directories) {
        const filePath = path.resolve(`${dir}/${fileName}`);
        const fileExists = fs.existsSync(filePath);

        try {
            // Write to the file, creating or replacing it as necessary
            fs.writeFileSync(filePath, fileContent, { encoding: "utf8" });

            if (fileExists) {
                return message.reply(`File ${fileName} already existed. Content has been replaced.`);
            } else {
                return message.reply(`File ${fileName} created successfully in ${dir}`);
            }
        } catch (error) {
            return message.reply(`Error creating or replacing file content: ${error.message}`);
        }
    }

    return message.reply("⚠️ Could not create or replace the file in any category.");
}

export default {
    config,
    onCall,
};