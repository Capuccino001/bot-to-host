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
    credits: "Coffee & XaviaTeam"
};

const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
];

export async function onCall({ message, args }) {
    const fileName = args.join(" ");
    if (!fileName) {
        return await message.reply("✖️ Please provide the file name to upload.");
    }

    let fileContent;
    for (const dir of directories) {
        try {
            const filePath = path.resolve(`${dir}/${fileName}.js`);
            fileContent = fs.readFileSync(filePath, "utf8");
            break; // Stop once the file is found
        } catch (error) {
            // Continue to the next directory if the file is not found
        }
    }

    if (fileContent) {
        try {
            await message.react("🕰️");
            const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
            const nekobinUrl = await samirapi.nekobin(fileContent);

            stopTypingIndicator();

            console.log("Nekobin URL: ", nekobinUrl);

            if (nekobinUrl) {
                await message.send(`📝 File uploaded to Nekobin: ${nekobinUrl}`);
                await message.react("✔️");
            } else {
                await message.send("⚠️ Failed to upload the file to Nekobin.");
            }
        } catch (error) {
            console.error("Nekobin upload failed: ", error);
            await message.react("✔️");
            await message.send("⚠️ Sorry, I couldn't upload the file. Please try again later.");
        }
    } else {
        await message.send("⚠️ File not found in any category!");
    }
}

export default {
    config,
    onCall,
};