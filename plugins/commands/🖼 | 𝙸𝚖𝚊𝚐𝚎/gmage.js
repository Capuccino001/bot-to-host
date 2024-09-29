const config = {
    name: "gmage",
    aliases: ["gimage", "imgsearch"],
    description: "Searches Google for images based on a query.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userQuery = args.join(" ");

    if (!userQuery) return message.reply("Please provide a query to search for images.");

    await message.react("🕰️"); // Indicate processing

    // Use the provided API to search for images, setting count to 12
    const apiUrl = `https://openapi-idk8.onrender.com/google/image?search=${encodeURIComponent(userQuery)}&count=12`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("Failed to fetch data");

        const { images = [] } = await response.json();

        if (images.length === 0) {
            await message.reply("No images were found.");
            await message.react("❎"); // React with ❎ if no images are found
            return;
        }

        // Send all images as one message
        const imageUrls = images.join("\n");
        await message.reply(`Here are the images for "${userQuery}":\n${imageUrls}`);
        await message.react("✅"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("❎"); // React with ❎ on error
        await message.reply("An error occurred while fetching the images."); // Error message
    }
}

export default {
    config,
    onCall,
};