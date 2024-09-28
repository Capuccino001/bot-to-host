import axios from 'axios';
import fs from 'fs';

const config = {
    name: "fbdl",
    aliases: ["fbdown", "facebookdl"],
    description: "Download Facebook reels by providing the reel URL.",
    usage: "[reel URL]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const reelUrl = args.join(" ");

    if (!reelUrl) return message.reply("Please provide the Facebook reel URL.");

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://deku-rest-api.gleeze.com/api/fbdl2?url=${encodeURIComponent(reelUrl)}`;

    try {
        const response = await axios.get(apiUrl);

        if (response.data.status !== 200) throw new Error("Failed to fetch data");

        const { normal_video } = response.data.result;

        if (normal_video) {
            // Download the video as a stream
            const videoResponse = await axios.get(normal_video, { responseType: 'stream' });
            
            // Define a temporary file path
            const filePath = './plugins/commands/cache/fb_video.mp4';

            // Create a writable stream for the file
            const writer = fs.createWriteStream(filePath);

            // Pipe the video stream to the file
            videoResponse.data.pipe(writer);

            // Wait for the stream to finish
            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            // Send the video as an attachment
            await message.reply({
                files: [{
                    attachment: filePath,
                    name: 'facebook_video.mp4',
                }]
            });

            // React with ✅ on success
            await message.react("✅");

            // Clean up the temporary file after sending
            fs.unlinkSync(filePath);

        } else {
            await message.react("❎"); // React with ❎ if no video found
            await message.reply("Sorry, I couldn't find the video.");
        }
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply("An error occurred while fetching the data."); // Error message
    }
}

export default {
    config,
    onCall,
};