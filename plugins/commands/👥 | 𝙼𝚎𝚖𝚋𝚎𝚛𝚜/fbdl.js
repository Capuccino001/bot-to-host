const config = {
    name: "fbdl",
    aliases: ["fbdownloader", "fbvid"],
    description: "Download Facebook reels or videos by providing the URL.",
    usage: "[Facebook video URL]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args, threadID }) {
    const videoUrl = args.join(" ");

    if (!videoUrl) return message.reply("Please provide a valid Facebook video URL.");

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://deku-rest-api.gleeze.com/api/fbdl2?url=${encodeURIComponent(videoUrl)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("Failed to fetch data");

        const { result = {} } = await response.json();
        const { normal_video: normalVideo } = result;

        if (!normalVideo) throw new Error("No video found.");

        await message.react("✔️"); // React with ✔️ on success

        // Send the video URL as a message in the same thread where the request was made
        await message.client.sendMessage(threadID, normalVideo);
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ✖️ on error
        await message.reply("An error occurred while fetching the video."); // Error message
    }
}

export default {
    config,
    onCall,
};