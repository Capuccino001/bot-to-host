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
const REACTION_PROCESSING = "🕰️";
const REACTION_SUCCESS = "✅";
const REACTION_ERROR = "❎";
const DEFAULT_COUNT = 12; // Always fetch 12 images

async function onCall({ message, args }) {
    const userSearchTerm = args.join(" ");

    if (!userSearchTerm) {
        return message.reply("Please provide a search term.");
    }

    await message.react(REACTION_PROCESSING); // Indicate processing

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
            const attachments = images.map(img => img.url); // Get URLs for the attachments
            await message.reply({ 
                content: `Here are some images for "${userSearchTerm}":`, // Updated message content
                files: attachments // Send images as attachments
            });
        }

        await message.react(REACTION_SUCCESS); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react(REACTION_ERROR); // React with ❎ on error
        await message.reply(`An error occurred: ${error.message || "Unable to fetch images."}`); // Provide error context
    }
}

export default {
    config,
    onCall,
};