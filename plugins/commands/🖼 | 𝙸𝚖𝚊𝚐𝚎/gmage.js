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
const DEFAULT_COUNT = 12; // Always fetch 12 images

async function onCall({ message, args }) {
    const userSearchTerm = args.join(" ");

    if (!userSearchTerm) return message.reply("Please provide a search term.");

    await message.react("🕰️"); // Indicate processing

    try {
        const response = await fetch(`${API_URL}?search=${encodeURIComponent(userSearchTerm)}&count=${DEFAULT_COUNT}`);
        const data = await response.json();

        if (!response.ok || !data.images?.length) {
            const errorMessage = data.error || "No images found for your search.";
            throw new Error(errorMessage);
        }

        const attachments = data.images.map(img => ({
            attachment: img.url,
            name: `${userSearchTerm}_${img.url.split('/').pop()}`,
        }));

        await message.reply({
            content: `Here are the images for "${userSearchTerm}":`,
            files: attachments,
        });

        await message.react("✅"); // Success reaction
    } catch (error) {
        console.error(error);
        await message.react("❎"); // Error reaction
        await message.reply(`An error occurred: ${error.message}`);
    }
}

export default {
    config,
    onCall,
};