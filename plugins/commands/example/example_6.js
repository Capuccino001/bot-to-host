const config = {
    name: "example",
    aliases: ["example"],
    description: "Example command template.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userQuery = args.join(" ");

    if (!userQuery) return message.reply("Please provide a query.");

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://example.com/api?query=${encodeURIComponent(userQuery)}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        const { result = "⚠️ Sorry, I couldn't find a result." } = await response.json();

        await message.reply(result); // Send back the result
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