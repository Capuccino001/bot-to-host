import axios from "axios";
import fs from "fs-extra";
import { join } from "path";

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

// Prepare the cache directory
const cacheDir = join(__dirname, "cache");
fs.ensureDirSync(cacheDir); // Ensures the cache directory exists

async function onCall({ message, args, event, api }) {
    let imageUrl;

    // Check if the message is a reply and has an attachment (image or sticker)
    if (event.type === "message_reply" && event.messageReply?.attachments?.[0]) {
        const attachmentType = event.messageReply.attachments[0].type;
        if (["photo", "sticker"].includes(attachmentType)) {
            imageUrl = event.messageReply.attachments[0].url;
        }
    } else if (args[0]?.match(/(https?:\/\/.*\.(?:png|jpg|jpeg))/g)) {
        imageUrl = args[0];
    } else {
        return await message.reply("✖️ Please provide an image URL or reply to an image.");
    }

    const processingMessage = await message.reply("🕰️ Removing background...");

    try {
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
        const filePath = join(cacheDir, fileName); // Use cache directory for storing the image

        fs.writeFileSync(filePath, outputBuffer);

        // Send the image as an attachment
        await message.reply({ attachment: fs.createReadStream(filePath) });

        // Delete the temporary image file after sending
        fs.unlinkSync(filePath);
    } catch (error) {
        console.error("RemoveBG API call failed: ", error);
        await message.reply("⚠️ Something went wrong. Please try again later. The issue has been reported.");

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
    } finally {
        // Remove the processing message
        await message.unsend(processingMessage.messageID);
    }
}

export default {
    config,
    onCall,
};