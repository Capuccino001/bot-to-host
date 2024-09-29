import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';

const config = {
    name: "gmage",
    aliases: ["gimg"],
    description: "Search for images on Google.",
    usage: "[query]",
    category: "Image",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "coffee",
    extra: {
        searchType: "images",
    },
};

const API_KEY = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
const SEARCH_ENGINE_ID = 'e01c6428089ea4702';
const CACHE_DIR = './plugins/commands/cache';

const downloadImage = async (imageUrl) => {
    try {
        const { headers } = await axios.head(imageUrl);
        if (!headers['content-type'].startsWith('image/')) {
            throw new Error(`Invalid image type: ${imageUrl}`);
        }

        const response = await axios.get(imageUrl, { responseType: 'stream' });
        const outputFileName = path.join(CACHE_DIR, `downloaded_image_${Date.now()}.png`);
        const writer = fs.createWriteStream(outputFileName);

        await new Promise((resolve, reject) => {
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return outputFileName; // Return the file path of the downloaded image
    } catch (error) {
        console.error(`Error downloading image (${imageUrl}): ${error.message}`);
        return null; // Return null for invalid images
    }
};

const cleanupImages = async (imagePaths) => {
    await Promise.all(
        imagePaths.map(imagePath => fs.remove(imagePath).catch(err => {
            console.error(`Error cleaning up image (${imagePath}): ${err.message}`);
        }))
    );
};

const fetchImages = async (searchQuery) => {
    const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
        params: {
            key: API_KEY,
            cx: SEARCH_ENGINE_ID,
            q: searchQuery,
            searchType: 'image',
        },
    });
    return response.data.items?.slice(0, 12) || []; // Default to empty array if no items
};

const onCall = async ({ api, event, args }) => {
    if (args.length === 0) {
        return await api.sendMessage('📷 | Please provide a search query. Usage: -gmage [query]', event.threadID, event.messageID);
    }

    const searchQuery = args.join(' ');

    try {
        const images = await fetchImages(searchQuery);
        if (images.length === 0) {
            return await api.sendMessage(`📷 | No images found for "${searchQuery}".`, event.threadID, event.messageID);
        }

        const imgPromises = images.map(image => downloadImage(image.link));
        const validImages = await Promise.all(imgPromises);

        const nonNullImages = validImages.filter(Boolean);
        if (nonNullImages.length === 0) {
            return await api.sendMessage('📷 | No valid images could be downloaded. Please try again later.', event.threadID, event.messageID);
        }

        await api.sendMessage({
            body: `Here are some images for "${searchQuery}":`,
            attachment: nonNullImages.map(filePath => fs.createReadStream(filePath)),
        }, event.threadID, event.messageID);

        // Cleanup the downloaded images
        await cleanupImages(nonNullImages);
    } catch (error) {
        console.error(`API call failed: ${error.message}`);
        await api.sendMessage('📷 | An error occurred while fetching images. Please try again later.', event.threadID, event.messageID);
    }
};

export default {
    config,
    onCall,
};