import samirapi from 'samirapi';

const config = {
    name: "gmage",
    aliases: ["googleimage", "gis"],
    description: "Search Google for images.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    if (!args.length) {
        return await message.reply("✖️ Please provide a query to search for images.");
    }

    const query = args.join(" ");

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const images = await samirapi.googleImageSearch(query);

        stopTypingIndicator();

        console.log("Google Image Search Results: ", images);

        if (images && images.length > 0) {
            const imageMessage = images.slice(0, 12).join("\n"); // Limiting to 12 images max
            await message.send(imageMessage);
            await message.react("✔️");
        } else {
            await message.send("⚠️ No images found for the given query.");
        }
    } catch (error) {
        console.error("Image search failed: ", error);
        await message.react("✖️");
        await message.send("⚠️ Sorry, I couldn't fetch images. Please try again later.");
    }
}

export default {
    config,
    onCall,
};