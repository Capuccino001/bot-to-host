import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
    name: "gmage",
    aliases: ["gimg"],
    description: "Search for images on Google and return them as attachments.",
    usage: "[search term]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

const API_URL = "https://openapi-idk8.onrender.com/google/image";
const CACHE_DIR = "./plugins/commands/cache"; // Directory to store images temporarily
const DEFAULT_COUNT = 12; // Always fetch 12 images

async function onCall({ message, args }) {
    const userSearchTerm = args.join(" ");

    if (!userSearchTerm) {
        return message.reply("Please provide a search term.");
    }

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `${API_URL}?search=${encodeURIComponent(userSearchTerm)}&count=${DEFAULT_COUNT}`;

    try {
        // Fetch images from API
        const response = await fetch(apiUrl);

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.error || "Failed to fetch data");
        }

        const { images = [] } = await response.json();

        if (images.length === 0) {
            await message.reply("No images found for your search.");
        } else {
            // Download images
            const imageUrls = images.map(img => img.url);
            const downloadedImages = await downloadImages(imageUrls);

            // Reply with downloaded images as attachments
            await message.reply({
                content: `Here are ${downloadedImages.length} images for your search: "${userSearchTerm}"`,
                attachments: downloadedImages.map(filePath => fs.createReadStream(filePath)),
            });

            // Cleanup downloaded images
            await cleanupFiles(downloadedImages);
        }

        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply(`An error occurred: ${error.message || "Unable to fetch images."}`); // Provide error context
    }
}

// Function to download images from URLs
async function downloadImages(imageUrls) {
    const filePaths = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const imageUrl = imageUrls[i];
        const filePath = path.join(CACHE_DIR, `image${i}.jpg`);

        try {
            const response = await axios({
                method: "GET",
                url: imageUrl,
                responseType: "stream",
            });

            // Write image to file
            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            // Wait for the file to finish writing
            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            filePaths.push(filePath);
        } catch (error) {
            console.error(`Failed to download image: ${imageUrl}`, error);
        }
    }

    return filePaths;
}

// Function to clean up downloaded images
async function cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
            }
        });
    }
}

export default {
    config,
    onCall,
};