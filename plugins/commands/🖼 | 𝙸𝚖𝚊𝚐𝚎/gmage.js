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
    try {
        if (args.length === 0) {
            return await message.reply('📷 | Follow this format:\n-gmage naruto uzumaki');
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
            if (!image) {
                // Skip null values
                continue;
            }

            const imageUrl = image.link;

            try {
                const imageResponse = await axios.head(imageUrl); // Attempt to check if the image URL is valid

                // Check if the response headers indicate a valid image
                if (imageResponse.headers['content-type'].startsWith('image/')) {
                    const response = await axios({
                        method: 'get',
                        url: imageUrl,
                        responseType: 'stream',
                    });

                    const outputFileName = path.join('./plugins/commands/cache', `downloaded_image_${imgData.length + 1}.png`);
                    const writer = fs.createWriteStream(outputFileName);

                    response.data.pipe(writer);

                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });

                    imgData.push(fs.createReadStream(outputFileName));
                    imagesDownloaded++;
                } else {
                    console.error(`Invalid image (${imageUrl}): Content type is not recognized as an image.`);
                }
            } catch (error) {
                console.error(`Error downloading image (${imageUrl}):`, error);
                // Skip the current image if there's an error
                continue;
            }
        }

        if (imagesDownloaded > 0) {
            // Send only non-bad images as attachments
            await message.reply({
                body: `Here are some images for "${searchQuery}":`,
                attachment: imgData,
            });
        } else {
            await message.reply('📷 | I can\'t get your images at the moment, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)');
        }
    } catch (error) {
        console.error(error);
        await message.reply('📷 | I can\'t get your images at the moment, do try again later... (⁠｡⁠ŏ⁠﹏⁠ŏ⁠)');
    }
}

export default {
    config,
    onCall,
};