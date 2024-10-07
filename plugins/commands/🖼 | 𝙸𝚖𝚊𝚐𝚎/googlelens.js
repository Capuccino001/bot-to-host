import axios from 'axios';

const config = {
    name: "googlelens",
    aliases: ["lens"],
    description: "Search using Google Lens.",
    usage: "Reply to an image or sticker",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Google",
};

async function onCall({ message, api }) {
    const { messageReply } = message; // Get messageReply directly from the message
    const { attachments, threadID } = messageReply || {};

    if (!attachments || !["photo", "sticker"].includes(attachments[0]?.type)) {
        return await message.reply("Please reply to an image or sticker.");
    }

    const { url: imageUrl } = attachments[0] || {};

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://deku-rest-api.gleeze.com/api/glens?url=${encodeURIComponent(imageUrl)}`;

    try {
        const response = await axios.get(apiUrl);

        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        const { data } = response.data;

        if (!data || data.length === 0) return message.reply("⚠️ No results found.");

        const results = data.map((result, index) => {
            return `**${index + 1}. ${result.title}**\nDomain: ${result.domain}\nLink: ${result.link}`;
        }).join("\n\n");

        await message.reply(results, threadID); // Send back the results
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.", threadID); // Error message
    }
}

export default {
    config,
    onCall,
};
