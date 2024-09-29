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

async function onCall({ message, args }) {
    if (args.length === 0) {
        return await message.reply('📷 | Follow this format:\n-gmage naruto uzumaki');
    }

    const searchQuery = args.join(' ');
    const apiKey = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
    const searchEngineID = 'e01c6428089ea4702';

    try {
        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: apiKey,
                cx: searchEngineID,
                q: searchQuery,
                searchType: 'image',
            },
        });

        const images = response.data.items?.slice(0, 12) || [];
        if (images.length === 0) {
            return await message.reply(`📷 | No images found for "${searchQuery}".`);
        }

        const imgData = await Promise.all(images.map(downloadImage));
        const validImages = imgData.filter(img => img); // Filter out null images

        if (validImages.length > 0) {
            await message.reply({
                body: `Here are some images for "${searchQuery}":`,
                attachment: validImages,
            });

            // Clean up downloaded images after sending
            await Promise.all(validImages.map(img => fs.remove(img.path)));
        } else {
            await message.reply('📷 | No valid images found, please try again later.');
        }
    } catch (error) {
        console.error('Error during image search:', error);
        await message.reply(`📷 | An error occurred: ${error.message || 'Unknown error'}`);
    }
}

async function downloadImage(image) {
    if (!image) return null;

    const imageUrl = image.link;

    try {
        const imageResponse = await axios.head(imageUrl);
        if (!imageResponse.headers['content-type'].startsWith('image/')) {
            console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
            return null;
        }

        const response = await axios({
            method: 'get',
            url: imageUrl,
            responseType: 'stream',
        });

        const outputFileName = path.join('./plugins/commands/cache', `downloaded_image_${Date.now()}.png`);
        const writer = fs.createWriteStream(outputFileName);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        return { path: outputFileName, stream: fs.createReadStream(outputFileName) };
    } catch (error) {
        console.error(`Error downloading image (${imageUrl}):`, error);
        return null; // Return null on error to filter out later
    }
}

export default {
    config,
    onCall,
};