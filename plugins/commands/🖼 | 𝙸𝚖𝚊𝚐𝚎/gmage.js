const config = {
    name: "gmage",
    aliases: ["gimg"],
    description: "Search for images on Google and return 12 image URLs in an embed.",
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
        await message.reply("📷 | Please provide a search query. Example: gmage cats");
        return;
    }

    const query = args.join(" ").trim();
    const apiUrl = `https://openapi-idk8.onrender.com/google/image?search=${encodeURIComponent(query)}&count=12`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.images && data.images.length > 0) {
            // Create an array of embed fields containing the image URLs
            const embedFields = data.images.map((image, index) => ({
                name: `Image ${index + 1}`,
                value: image.url,
                inline: true
            }));

            // Send the embed with the image URLs
            await message.reply({
                embed: {
                    title: `Search results for "${query}"`,
                    description: "Here are the top 12 images found:",
                    fields: embedFields,
                    color: 0x00FF00 // Set the color of the embed (optional)
                }
            });
        } else {
            await message.reply(`I couldn't find any images for "${query}".`);
        }

    } catch (error) {
        console.error(error);
        await message.reply("There was an error accessing the Google Image Search API. Please try again later.");
    }
}

export default {
    config,
    onCall,
};