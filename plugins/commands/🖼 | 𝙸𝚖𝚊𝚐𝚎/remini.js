import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = path.join(__dirname, './plugins/commands/cache');

const config = {
    name: 'remini',
    version: '1.0.0',
    permissions: [0],
    credits: 'Cache',
    description: 'Enhance the image',
    commandCategory: 'Images',
    usages: 'Reply to the image',
    category: "𝙸𝚖𝚊𝚐𝚎",
    cooldown: 5,
    dependencies: {}
};

// Function to enhance the image
async function onCall({ message }) {
    const reply = message.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return message.reply("📷 Please reply to the image to enhance it.");
    }

    const attachment = reply.attachments[0];
    
    if (attachment.type !== "photo") {
        return message.reply("❌ This is not a photo.");
    }

    try {
        const imageUrl = attachment.url;
        const enhancedImage = await fetchEnhancedImage(imageUrl);

        // Ensure the cache directory exists
        await fs.ensureDir(cachePath);

        // Save the image to the cache directory
        const filePath = path.join(cachePath, '4k.png');
        await fs.outputFile(filePath, enhancedImage);

        // Send the enhanced image as a reply
        await message.reply({
            body: "✨ The image has been successfully enhanced.",
            attachment: fs.createReadStream(filePath)
        });
    } catch (error) {
        console.error(error);
        return message.reply("⚠️ An error occurred while processing the image. Please try again later.");
    }
}

// Function to fetch the enhanced image from the API
async function fetchEnhancedImage(imageUrl) {
    const response = await axios.get(`https://4k-ayoub.vercel.app/upscale?url=${encodeURIComponent(imageUrl)}`, {
        responseType: 'arraybuffer'
    });

    if (response.status !== 200) {
        throw new Error("Failed to fetch the enhanced image.");
    }

    return Buffer.from(response.data, 'binary');
}

export default {
    config,
    onCall
};