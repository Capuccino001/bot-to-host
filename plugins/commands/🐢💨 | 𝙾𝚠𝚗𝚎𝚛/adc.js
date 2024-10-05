import axios from 'axios';
import fs from 'fs';
import path from 'path';

const config = {
    name: "adc",
    aliases: ["adc"],
    description: "Upload or download code using Pastebin.",
    usage: "[file name] or reply to a message with Pastebin URL",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

// Directories to search for commands
const directories = [
    "plugins/commands/🐢💨 | 𝙾𝚠𝚗𝚎𝚛",
    "plugins/commands/🎧 | 𝙼𝚞𝚜𝚒𝚌",
    "plugins/commands/👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    "plugins/commands/📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗",
    "plugins/commands/🖼 | 𝙸𝚖𝚊𝚐𝚎"
];

const PASTEBIN_API_KEY = 'a62m-1-BrPVYSYJrzwjKXLDouqGw-Es-'; 
// Make sure this API key is correct

async function createPaste(code, name) {
    try {
        const response = await axios.post('https://pastebin.com/api/api_post.php', null, {
            params: {
                api_dev_key: PASTEBIN_API_KEY,
                api_option: 'paste',
                api_paste_code: code,
                api_paste_name: name,
                api_paste_expire_date: 'N',
                api_paste_format: 'javascript',
                api_paste_private: 1 // 0 = public, 1 = unlisted, 2 = private
            }
        });
        if (response.data.startsWith('Bad API request')) {
            throw new Error(response.data); // Log Pastebin-specific errors
        }
        return response.data;
    } catch (error) {
        console.error("Failed to create Pastebin paste:", error.response ? error.response.data : error.message);
        throw new Error("Failed to create Pastebin paste.");
    }
}

// Function to search for the file in the directories
function findCommandFile(fileName) {
    for (const dir of directories) {
        const filePath = path.resolve(dir, `${fileName}.js`);
        if (fs.existsSync(filePath)) {
            return filePath;
        }
    }
    return null;
}

async function onCall({ message, args }) {
    const { senderID, threadID, messageID, messageReply, type } = message;
    const text = messageReply ? messageReply.body : null;

    // Handle uploading local file to Pastebin
    if (!text && args[0]) {
        const fileName = args[0];
        const filePath = findCommandFile(fileName);

        if (!filePath) {
            return message.reply(`File ${fileName}.js does not exist in any directory.`, threadID, messageID);
        }

        fs.readFile(filePath, "utf-8", async (err, data) => {
            if (err) return message.reply(`Error reading ${fileName}.js.`, threadID, messageID);

            try {
                const pasteUrl = await createPaste(data, fileName);
                const rawLink = pasteUrl.replace('/pastebin.com/', '/pastebin.com/raw/');
                return message.reply(rawLink, threadID, messageID);
            } catch (error) {
                return message.reply("Error uploading to Pastebin. Please check your API key or try again later.");
            }
        });
        return;
    }

    // Handle downloading from Pastebin
    const urlR = /https?:\/\/pastebin\.com\/([a-zA-Z0-9]+)/;
    if (text && urlR.test(text)) {
        const pastebinUrl = text.match(urlR)[0];

        axios.get(`${pastebinUrl}/raw`).then(async (response) => {
            const data = response.data;
            const fileName = args[0] || 'newFile';

            const filePath = path.resolve(directories[0], `${fileName}.js`);

            fs.writeFile(filePath, data, "utf-8", (err) => {
                if (err) return message.reply(`Error saving ${fileName}.js`, threadID, messageID);
                
                message.reply(`Saved code as ${fileName}.js in ${directories[0]}`, threadID, messageID);
            });
        }).catch((err) => {
            message.reply("Error fetching from Pastebin. Make sure the link is correct.");
        });
        return;
    }

    message.reply('Please reply to a Pastebin URL or provide a file name.', threadID, messageID);
}

export default {
    config,
    onCall,
};