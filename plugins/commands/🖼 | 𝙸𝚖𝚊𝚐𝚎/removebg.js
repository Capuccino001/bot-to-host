import { writeFileSync, existsSync, mkdirSync, createReadStream, unlinkSync } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..');
const apiKey = "hgEG2LSoC8VD5A2akNvcFySR";

const config = {
    name: "removebg",
    aliases: ["rbg"],
    description: "Remove background from an image. Reply to an image or add an image URL to use the command.",
    usage: "reply to an image or add an image URL",
    cooldown: 20,
    permissions: [0],
    credits: "Strawhat Luffy & kshitiz",
};

async function onCall({ message }) {
    const { messageReply } = message; // Get messageReply directly from the message
    const { attachments, threadID } = messageReply || {};
    
    let imageUrl;

    // Check if the message is a reply with attachments
    if (attachments && ["photo", "sticker"].includes(attachments[0]?.type)) {
        imageUrl = attachments[0].url;
    } else if (message.args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
        imageUrl = message.args[0];
    } else {
        return await message.reply("✖️ Please provide an image URL or reply to an image.");
    }

    const processingMessage = await message.reply("🕰️ Removing background...");

    try {
        // Make API request to remove background
        const response = await axios.post(
            "https://api.remove.bg/v1.0/removebg",
            { image_url: imageUrl, size: "auto" },
            {
                headers: {
                    "X-Api-Key": apiKey,
                    "Content-Type": "application/json",
                },
                responseType: "arraybuffer",
            }
        );

        const outputBuffer = Buffer.from(response.data, "binary");
        const cacheDir = join(__dirname, "cache");

        // Ensure cache directory exists
        if (!existsSync(cacheDir)) {
            mkdirSync(cacheDir, { recursive: true });
        }

        const filePath = join(cacheDir, `${Date.now()}.png`);
        writeFileSync(filePath, outputBuffer);

        // Reply with the image as an attachment using message.send
        await message.send({ attachment: createReadStream(filePath) }, threadID);

        // Delete the temporary image file after sending
        unlinkSync(filePath);

    } catch (error) {
        console.error("RemoveBG API call failed: ", error);
        await message.reply("⚠️ Something went wrong. Please try again later.");

        // Notify admin of the error
        const errorMessage = `
            ----RemoveBG Log----
            Something is causing an error with the removebg command.
            Check if the API key is still valid at: https://www.remove.bg/dashboard
        `;
        const { config } = global.GoatBot;
        for (const adminID of config.adminBot) {
            await message.send(errorMessage, adminID); // Change to message.send
        }
    }

    // Optionally inform the user that processing is complete without removing the message
    await message.reply("✅ Background removal complete!");
}

export default {
    config,
    onCall,
};