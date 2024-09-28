import samirapi from 'samirapi';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const config = {
    name: "pinterest",
    aliases: ["pin"],
    description: "Search for images on Pinterest based on a query.",
    usage: "[query] -[number of images]",
    category: "𝙸𝚖𝚊𝚐𝚎",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "coffee",
    extra: {
        searchType: "images",
    },
};

const cachePath = path.join(__dirname, './plugins/commands/cache');

// Ensure cache directory exists
if (!fs.existsSync(cachePath)) {
    fs.mkdirSync(cachePath, { recursive: true });
}

async function onCall({ message, args }) {
    if (args.length === 0) {
        await message.reply("📷 | Please follow this format:\n-pinterest cat -5");
        return;
    }

    const { query, imageCount } = parseArgs(args);

    try {
        const allImages = await fetchImages(query, imageCount);

        if (allImages.length > 0) {
            const filePaths = await downloadImages(allImages);
            await message.reply({
                body: `Here are the top ${filePaths.length} images for "${query}".`,
                attachment: filePaths.map(filePath => fs.createReadStream(filePath))
            });

            cleanupFiles(filePaths);
        } else {
            await message.reply(`I couldn't find any images for "${query}".`);
        }

    } catch (error) {
        console.error(error);
        await message.reply("There was an error accessing Pinterest or downloading the images. Please try again later.");
    }
}

function parseArgs(args) {
    const countArg = args[args.length - 1];
    let imageCount = 1;

    if (countArg.startsWith('-')) {
        imageCount = parseInt(countArg.slice(1), 10);
        if (isNaN(imageCount) || imageCount < 1) {
            imageCount = 1;
        } else if (imageCount > 12) {
            imageCount = 12;
        }
        args.pop(); // Remove the count argument
    }

    const query = args.join(" ");
    return { query, imageCount };
}

async function fetchImages(query, requestedCount) {
    const allImages = [];
    let fetchedImagesCount = 0;

    while (fetchedImagesCount < requestedCount) {
        const remaining = requestedCount - fetchedImagesCount;
        const fetchLimit = Math.min(6, remaining);

        const images1 = await samirapi.searchPinterest(query);
        if (images1.result) {
            allImages.push(...images1.result.slice(0, fetchLimit));
            fetchedImagesCount += images1.result.length;
        }

        if (fetchedImagesCount < requestedCount) {
            const images2 = await samirapi.searchPinterest(`${query} 1`);
            if (images2.result) {
                allImages.push(...images2.result.slice(0, fetchLimit));
                fetchedImagesCount += images2.result.length;
            }
        }

        if (fetchedImagesCount >= requestedCount) break;
    }

    return allImages.slice(0, requestedCount);
}

async function downloadImages(imageUrls) {
    const filePaths = [];

    for (let i = 0; i < imageUrls.length; i++) {
        const url = imageUrls[i];
        const filePath = path.join(cachePath, `image${i}.jpg`);
        
        const response = await axios.get(url, { responseType: 'stream' });
        const writer = fs.createWriteStream(filePath);
        
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