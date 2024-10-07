const config = {
    name: "googlelens",
    aliases: ["lens"],
    description: "Search using Google Lens.",
    usage: "Reply to an image or sticker",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Google",
};

async function onCall({ message }) {
    if (!message.reference) return message.reply("Please reply to an image or sticker.");

    const repliedMessage = message.reference.message;

    if (!repliedMessage.attachments || repliedMessage.attachments.length === 0) return message.reply("Please reply to an image or sticker.");

    const attachment = repliedMessage.attachments[0];

    if (!attachment.url) return message.reply("Please reply to an image or sticker.");

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://deku-rest-api.gleeze.com/api/glens?url=${encodeURIComponent(attachment.url)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        const { data } = await response.json();

        if (!data || data.length === 0) return message.reply("⚠️ No results found.");

        const results = data.map((result, index) => {
            return `**${index + 1}. ${result.title}**\nDomain: ${result.domain}\nLink: ${result.link}`;
        }).join("\n\n");

        await message.reply(results); // Send back the results
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data."); // Error message
    }
}

export default {
    config,
    onCall,
};
