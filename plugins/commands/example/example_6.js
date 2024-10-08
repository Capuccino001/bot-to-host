const config = {
    name: "exampleapi",
    aliases: ["example1"],
    description: "Example command template.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

// Function to fetch data from API and handle response
const fetchApiData = async (query) => {
    const apiUrl = `https://example.com/api?query=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("⚠️ Failed to fetch data");

    const { result = "⚠️ Sorry, I couldn't find a result." } = await response.json();
    return result;
};

// Reply event handler
async function reply({ eventData, message }) {
    if (eventData.type !== "message") return;

    const { body: userQuery } = message;

    try {
        await message.react("🕰️"); // Indicate processing
        const result = await fetchApiData(userQuery);
        await message.reply(result);
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.");
    }
}

async function onCall({ message, args }) {
    const userQuery = args.join(" ").trim();
    if (!userQuery) return message.reply("Please provide a query.");

    try {
        await message.react("🕰️"); // Indicate processing
        const result = await fetchApiData(userQuery);
        const msg = await message.reply(result);
        await message.react("✔️"); // React with ✅ on success

        // Attach reply event handler for follow-up messages
        msg.addReplyEvent({ callback: reply, type: "message", uid: message.senderID });
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.");
    }
}

export default {
    config,
    onCall
};
