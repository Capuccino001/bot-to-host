import axios from "axios";
import fs from "fs-extra";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = join(fileURLToPath(import.meta.url), "..");
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

// Function to check if the event is a reply to an image
function getImageUrlFromReply(event) {
    if (event && event.type === "message_reply") {
        const messageReply = event.messageReply;
        const attachments = messageReply?.attachments;

        if (attachments && attachments.length > 0) {
            const attachmentType = attachments[0].type;
            if (["photo", "sticker"].includes(attachmentType)) {
                return attachments[0].url; // Return the image URL
            }
        }
    }
    return null; // Return null if no image found
}

async function onCall({ message, args, event, api }) {
    let imageUrl = getImageUrlFromReply(event) || (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g) ? args[0] : null);

    // Handle case where imageUrl is still null
    if (!imageUrl) {
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
        const fileName = `${Date.now()}.png`;
        const filePath = join(__dirname, "cache", fileName); // Use cache directory

        // Ensure cache directory exists
        await fs.ensureDir(join(__dirname, "cache"));

        await fs.writeFile(filePath, outputBuffer);

        // Send the image as an attachment
        await message.reply({ attachment: fs.createReadStream(filePath) });

        // Delete the temporary image file after sending
        await fs.unlink(filePath);

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
            await api.sendMessage(errorMessage, adminID);
        }
    }

    // Remove the processing message
    await message.unsend(processingMessage.messageID);
}

export default {
    config,
    onCall,
};