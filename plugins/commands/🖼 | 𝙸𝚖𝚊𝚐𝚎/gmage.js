import axios from 'axios';
import fs from 'fs';
import path from 'path';

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
const CACHE_PATH = './plugins/commands/cache';
const DEFAULT_COUNT = 12; // Always fetch 12 images

async function onCall({ message, args }) {
    const userSearchTerm = args.join(" ");

    if (!userSearchTerm) {
        return message.reply("Please provide a search term.");
    }

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `${API_URL}?search=${encodeURIComponent(userSearchTerm)}&count=${DEFAULT_COUNT}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || "Failed to fetch data");
        }

        const { images = [] } = await response.json();

        if (images.length === 0) {
            await message.reply("No images found for your search.");
        } else {
            const filePaths = await downloadImages(images);
            await message.reply({
                body: `Here are some images for "${userSearchTerm}":`,
                attachment: filePaths.map(filePath => fs.createReadStream(filePath))
            });

            cleanupFiles(filePaths);
        }

        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply(`An error occurred: ${error.message || "Unable to fetch images."}`); // Provide error context
    }
}

async function downloadImages(imageUrls) {
    const filePaths = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const { url } = imageUrls[i];
        const filePath = path.join(CACHE_PATH, `image${i}.jpg`);
        const writer = fs.createWriteStream(filePath);

        const response = await axios({
            url,
            method: 'GET',
            responseType: 'stream',
        });

        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        filePaths.push(filePath);
    }

    return filePaths;
}

function cleanupFiles(filePaths) {
    filePaths.forEach(filePath => fs.unlinkSync(filePath));
}

export default {
    config,
    onCall,
};