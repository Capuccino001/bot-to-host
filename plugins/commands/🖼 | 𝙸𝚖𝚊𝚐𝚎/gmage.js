import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const config = {
    name: "gmage",
    aliases: ["gimage", "imgsearch"],
    description: "Search for images on Google.",
    usage: "[search term]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

const API_URL = "https://openapi-idk8.onrender.com/google/image";
const DEFAULT_COUNT = 12; // Always fetch 12 images

// Determine the current directory and set up a cache directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cacheDir = path.join(__dirname, './cache');

// Ensure the cache directory exists
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
}

async function onCall({ message, args }) {
    const userSearchTerm = args.join(" ");

    if (!userSearchTerm) {
        return message.reply("Please provide a search term.");
    }

    await message.react("🕰️"); // Indicate processing

    try {
        // Use axios to fetch images
        const response = await axios.get(`${API_URL}?search=${encodeURIComponent(userSearchTerm)}&count=${DEFAULT_COUNT}`);
        const data = response.data;

        // Check if the response was successful and contains images
        if (!data.images || !data.images.length) {
            const errorMessage = data.error || "No images found for your search.";
            throw new Error(errorMessage);
        }

        // Send initial message
        await message.reply(`Here are the images for "${userSearchTerm}":`);

        // Create an array of attachments and cache images if needed
        const attachments = await cacheImages(data.images, userSearchTerm);

        // Send images as attachments
        await message.channel.send({ files: attachments });

        await message.react("✅"); // Success reaction
    } catch (error) {
        console.error("Image search error:", error);
        await message.react("❎"); // Error reaction
        await message.reply(`An error occurred: ${error.message}`);
    }
}

async function cacheImages(images, searchTerm) {
    const cachedImages = [];

    for (let i = 0; i < images.length; i++) {
        const imgUrl = images[i].url;
        const filePath = path.join(cacheDir, `${searchTerm}_${i}.png`);

        // Fetch the image and write it to cache
        const imageResponse = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, imageResponse.data);
        cachedImages.push(filePath);
    }

    return cachedImages;
}

export default {
    config,
    onCall,
};