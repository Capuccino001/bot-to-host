import axios from 'axios';
import fs from 'fs';
import { PasteClient } from 'pastebin-api';
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

async function onCall({ message, args }) {
    const { senderID, threadID, messageID, messageReply, type } = message;
    const text = messageReply ? messageReply.body : null;

    const client = new PasteClient("N5NL5MiwHU6EbQxsGtqy7iaodOcHithV");
    
    // Handle uploading local file to Pastebin
    if (!text && args[0]) {
        const fileName = args[0];
        const filePath = path.resolve(__dirname, `${fileName}.js`);
        
        fs.readFile(filePath, "utf-8", async (err, data) => {
            if (err) return message.reply(`File ${fileName}.js does not exist.`, threadID, messageID);

            const url = await client.createPaste({
                code: data,
                expireDate: 'N',
                format: "javascript",
                name: fileName,
                publicity: 1
            });

            const rawLink = url.replace('/pastebin.com/', '/pastebin.com/raw/');
            return message.reply(rawLink, threadID, messageID);
        });
        return;
    }

    // Handle downloading from Pastebin
    const urlR = /https?:\/\/pastebin\.com\/([a-zA-Z0-9]+)/;
    if (text && urlR.test(text)) {
        const pastebinUrl = text.match(urlR)[0];
        
        axios.get(pastebinUrl).then(async (response) => {
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
