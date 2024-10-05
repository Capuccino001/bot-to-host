import { writeFileSync, existsSync, mkdirSync, createReadStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');

const config = {
    name: "remini",
    aliases: [],
    version: "2.0",
    author: "Vex_Kshitiz",
    description: "Enhance the image quality",
    usage: "(reply to an image)",
    cooldown: 20,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, api }) {
    const { messageReply } = message; // Adjusted to get messageReply directly from the message
    const { attachments, threadID } = messageReply || {};

    if (!attachments || !["photo", "sticker"].includes(attachments[0]?.type)) {
        return await message.reply("❌ | Please reply to an image.");
    }

    const { url: imageUrl } = attachments[0] || {};

    try {
        await message.react("🕰️");
        const stopTypingIndicator = api.sendTypingIndicator(threadID);

        // Make API request to enhance image
        const { data } = await axios.get(`https://vex-kshitiz.vercel.app/upscale?url=${encodeURIComponent(imageUrl)}`, {
            responseType: "json"
        });

        if (!data.result_url) {
            throw new Error("No result_url in API response.");
        }

        // Download enhanced image
        const enhancedImageUrl = data.result_url;
        const imageResponse = await axios.get(enhancedImageUrl, { responseType: "arraybuffer" });

        // Prepare cache directory and save the enhanced image
        const cacheDir = join(__dirname, "cache");
        if (!existsSync(cacheDir)) {
            mkdirSync(cacheDir, { recursive: true });
        }

        const imagePath = join(cacheDir, "remi_image.png");
        writeFileSync(imagePath, imageResponse.data);

        stopTypingIndicator();

        // Reply with the enhanced image
        await message.reply({ attachment: createReadStream(imagePath) }, threadID);
        await message.react("✔️");
    } catch (error) {
        console.error("Error enhancing image: ", error);
        await message.react("✖️");
        await message.reply("❌ | Error occurred while enhancing image.");
    }
}

export default {
    config,
    onCall,
};