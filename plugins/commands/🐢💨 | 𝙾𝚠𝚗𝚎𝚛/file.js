import fs from "fs";
import path from "path";

const config = {
    name: "file",
    aliases: ["file"],
    description: "Fetch the contents of a command file from multiple categories",
    usage: "[file name]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "XaviaTeam"
};

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
]; // change your directory path, depends on folder name.

export async function onCall({ message, args, event }) {
    const fileName = args.join(" ");
    if (!fileName) {
        return message.send("Please provide the file name.");
    }

    let fileContent;
    for (const dir of directories) {
        try {
            const filePath = path.resolve(`${dir}/${fileName}.js`);
            fileContent = fs.readFileSync(filePath, "utf8");
            break;
        } catch (error) {
            // Continue to next directory if file is not found
        }
    }

    if (fileContent) {
        try {
            return message.send(fileContent);
        } catch (error) {
            return message.send("⚠️ can't fetch the content of the command", event.senderID);
        }
    } else {
        return message.send("File not found in any category!");
    }
}

export default {
    config,
    onCall
};
