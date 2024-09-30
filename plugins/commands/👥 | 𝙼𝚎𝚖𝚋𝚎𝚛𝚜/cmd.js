import fs from "fs";
import path from "path";

const config = {
    name: "cmd",
    aliases: ["cmd"],
    description: "Creates a new file in the specified category with provided content",
    usage: "[file name] [content]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam",
};

const directories = [
    "plugins/commands"
];

export async function onCall({ message, args }) {
    const fileName = args[0];
    const fileContent = args.slice(1).join(" ");
    
    if (!fileName || !fileName.endsWith(".js")) {
        return message.send("Please provide a valid file name with the `.js` extension.");
    }

    if (!fileContent) {
        return message.send("Please provide content to put inside the file.");
    }

    for (const dir of directories) {
        const filePath = path.resolve(`${dir}/${fileName}`);
        try {
            fs.writeFileSync(filePath, fileContent, { encoding: "utf8" });
            return message.send(`File ${fileName} created successfully in ${dir}`);
        } catch (error) {
            // Catch errors for failed file creation attempts
        }
    }

    // If none of the directories worked, send an error message
    return message.send("⚠️ Could not create the file in any category.");
}

export default {
    config,
    onCall,
};