import path from 'path';
import fs from 'fs-extra';
import axios from 'axios';
import { fileURLToPath } from 'url';

// Manually define __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    try {
        if (args.length === 0) {
            return message.reply('📷 | Follow this format:\n-gmage naruto uzumaki');
        }

        const searchQuery = args.join(' ');
        const apiKey = 'AIzaSyC_gYM4M6Fp1AOYra_K_-USs0SgrFI08V0';
        const searchEngineID = 'e01c6428089ea4702';

        const response = await axios.get('https://www.googleapis.com/customsearch/v1', {
            params: {
                key: apiKey,
                cx: searchEngineID,
                q: searchQuery,
                searchType: 'image',
            },
        });

        const images = response.data.items.slice(0, 12); // Limit to the first 12 images

        const imgData = [];
        let imagesDownloaded = 0;

        for (const image of images) {
            if (!image) continue;

            const imageUrl = image.link;

            try {
                const imageResponse = await axios.head(imageUrl);

                if (imageResponse.headers['content-type'].startsWith('image/')) {
                    const response = await axios({
                        method: 'get',
                        url: imageUrl,
                        responseType: 'stream',
                    });

                    const outputFileName = path.join(__dirname, 'cache', `downloaded_image_${imgData.length + 1}.png`);
                    const writer = fs.createWriteStream(outputFileName);

                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    imgData.push(outputFileName); // Store the file path
                    imagesDownloaded++;
                } else {
                    console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
                }
            } catch (error) {
                console.error(`Error downloading image (${imageUrl}):`, error);
                continue;
            }
        }

        if (imagesDownloaded > 0) {
            const attachments = imgData.map(filePath => fs.createReadStream(filePath));
            await message.reply({ body: `Here are some images for "${searchQuery}":`, attachment: attachments });

            // Clean up images after sending
            await Promise.all(imgData.map(filePath => fs.remove(filePath)));
        } else {
            await message.reply("📷 | Can't get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)");
        }
    } catch (error) {
        console.error(error);
        await message.reply("📷 | Can't get your images atm, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)");
    }
}

export default {
    config,
    onCall,
};