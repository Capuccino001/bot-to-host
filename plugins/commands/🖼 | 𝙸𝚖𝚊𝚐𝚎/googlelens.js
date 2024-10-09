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

// Bold font mapping
const boldFontMap = {
    ' ': ' ',
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
    'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪',
    'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
    'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐',
    'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
};

// Function to convert text to bold font
const toBoldFont = (text) => {
    return text.split('').map(char => boldFontMap[char] || char).join('');
};

// Function to fetch data from Google Lens API and handle response
const fetchGoogleLensData = async (imageUrl) => {
    const apiUrl = `https://deku-rest-apis.ooguy.com/api/glens?url=${encodeURIComponent(imageUrl)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("⚠️ Failed to fetch data");

    const { status, data } = await response.json();
    if (!status || !data.length) throw new Error("⚠️ No results found.");

    return data.slice(0, 6); // Limit results to 6
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
        
        const replyMessages = results.map(item => 
            `${toBoldFont("Title:")} ${item.title}\n${toBoldFont("Source:")} ${item.source}\n${toBoldFont("Link:")} [View](${item.link})`
        ).join("\n\n");

        // Prepare thumbnails as attachments
        const attachmentsToSend = results.map(item => ({
            url: item.thumbnail,
            type: 'image'
        }));

        await message.reply({
            body: replyMessages,
            attachment: attachmentsToSend
        });

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
