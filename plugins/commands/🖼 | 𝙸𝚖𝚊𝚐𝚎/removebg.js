import samirapi from 'samirapi';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cachePath = path.join(__dirname, './plugins/commands/cache');

const config = {
    name: "removebg",
    version: "1.0.0",
    permissions: [0, 1, 2],
    credits: "coffee",
    description: "Removes the background from an image.",
    commandCategory: "𝙸𝚖𝚊𝚐𝚎",
    usages: "Reply to an image message to remove its background.",
    cooldown: 5,
};

async function onCall({ message }) {
    const reply = message.messageReply;

    if (!reply || !reply.attachments || reply.attachments.length === 0) {
        return message.reply("📷 Please reply to an image message to remove its background.");
    }

    const attachment = reply.attachments[0];
    
    if (attachment.type !== "photo") {
        return message.reply("❌ This is not a photo.");
    }

    try {
        const imageUrl = attachment.url;
        const imageBuffer = await samirapi.remBackground(imageUrl);
        const filePath = path.join(cachePath, 'no_background.png');

        // Ensure the cache directory exists
        await fs.ensureDir(cachePath);

        // Save the image with the background removed
        await fs.outputFile(filePath, imageBuffer);

        // Send the enhanced image as a reply
        await message.reply({
            body: "✨ Here is the image with the background removed:",
            attachment: fs.createReadStream(filePath)
        });
    } catch (error) {
        console.error(error);
        return message.reply("⚠️ An error occurred while removing the background. Please try again later.");
    } finally {
        // Cleanup the cached file if it exists
        try {
            await fs.unlink(filePath);
        } catch (cleanupError) {
            console.error("Cleanup failed:", cleanupError);
        }
    }
}

export default {
    config,
    onCall
};