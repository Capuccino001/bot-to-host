import axios from 'axios';

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

    const API_URL = `https://deku-rest-api.gleeze.com/api/fbdl2?url=${encodeURIComponent(reelUrl)}`;

    try {
        // Step 1: Fetch the content URL from the API
        const response = await axios.get(API_URL);

        if (response.data.status !== 200 || !response.data.result) {
            throw new Error("Failed to fetch video details");
        }

        // Extract the normal video URL
        const contentUrl = response.data.result.normal_video;

        if (!contentUrl) {
            await message.react("❎"); // React with ❎ if no video found
            return await message.reply("Sorry, I couldn't find the video.");
        }

        // Step 2: Download the video file as a buffer
        const videoResponse = await axios({
            url: contentUrl,
            method: 'GET',
            responseType: 'arraybuffer', // Get the response as a buffer
        });

        // Step 3: Send the video buffer as an attachment
        await message.send({ attachment: Buffer.from(videoResponse.data) });

        // React with ✅ on success
        await message.react("✅");

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