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

const PASTEBIN_API_KEY = 'N5NL5MiwHU6EbQxsGtqy7iaodOcHithV'; // Pastebin API key

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
        return response.data;
    } catch (error) {
        throw new Error("Failed to create Pastebin paste.");
    }
}

async function onCall({ message, args }) {
    const { senderID, threadID, messageID, messageReply, type } = message;
    const text = messageReply ? messageReply.body : null;

    // Handle uploading local file to Pastebin
    if (!text && args[0]) {
        const fileName = args[0];
        const filePath = path.resolve(__dirname, `${fileName}.js`);
        
        fs.readFile(filePath, "utf-8", async (err, data) => {
            if (err) return message.reply(`File ${fileName}.js does not exist.`, threadID, messageID);

            try {
                const pasteUrl = await createPaste(data, fileName);
                const rawLink = pasteUrl.replace('/pastebin.com/', '/pastebin.com/raw/');
                return message.reply(rawLink, threadID, messageID);
            } catch (error) {
                return message.reply("Error uploading to Pastebin.");
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

            fs.writeFile(path.resolve(__dirname, `${fileName}.js`), data, "utf-8", (err) => {
                if (err) return message.reply(`An error occurred while saving ${fileName}.js`, threadID, messageID);
                
                message.reply(`Saved code as ${fileName}.js`, threadID, messageID);
            });
        }).catch((err) => {
            message.reply("Error fetching from Pastebin. Make sure the link is correct.");
        });
        return;
    }

    // No file name or valid URL provided
    message.reply('Please reply to a Pastebin URL or provide a file name.', threadID, messageID);
}

export default {
    config,
    onCall,
};