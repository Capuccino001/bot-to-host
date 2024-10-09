import fetch from 'node-fetch'; // Ensure you have node-fetch installed

const config = {
    name: "googlelens",
    aliases: ["glens"],
    description: "Fetches information about an image using Google Lens.",
    usage: "[reply to an image message]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

// Function to fetch data from Google Lens API and handle response
const fetchGoogleLensData = async (imageUrl) => {
    const apiUrl = `https://deku-rest-apis.ooguy.com/api/glens?url=${encodeURIComponent(imageUrl)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("⚠️ Failed to fetch data");

    const { status, data } = await response.json();
    if (!status || !data.length) throw new Error("⚠️ No results found.");

    return data;
};

// Reply event handler
async function reply({ message }) {
    const { messageReply } = message; // Get the replied message
    const { attachments } = messageReply || {};

    if (!attachments || !attachments.length || !["photo", "sticker"].includes(attachments[0]?.type)) {
        await message.reply("⚠️ No image found in the replied message.");
        return;
    }

    const imageUrl = attachments[0].url; // Extract the image URL

    try {
        await message.react("🕰️"); // Indicate processing
        const results = await fetchGoogleLensData(imageUrl);
        const replyMessage = results.map(item => 
            `**Title:** ${item.title}\n**Source:** ${item.source}\n**Link:** [View](${item.link})\n![Thumbnail](${item.thumbnail})\n`
        ).join("\n");

        await message.reply(replyMessage);
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.");
    }
}

async function onCall({ message }) {
    // This command does not need to handle arguments directly
    // It will rely on the reply event handler
    await reply({ message });
}

export default {
    config,
    onCall
};
