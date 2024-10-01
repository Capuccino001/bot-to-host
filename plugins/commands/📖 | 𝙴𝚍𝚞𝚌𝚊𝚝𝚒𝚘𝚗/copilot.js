const config = {
    name: "copilot",
    aliases: ["cp", "assistant"],
    description: "Copilot command to interact with Bing API.",
    usage: "[query]",
    cooldown: 3,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userQuery = args.join(" ");
    const userId = 100; // Set the user ID as 100

    if (!userQuery) {
        return message.reply(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n⚠️ Please provide a query.\n━━━━━━━━━━━━━━━━`
        );
    }

    await message.react("🕰️"); // Indicate processing

    // Construct the API URL using the provided query and user ID set to 100
    const apiUrl = `https://samirxpikachuio.onrender.com/bing?message=${encodeURIComponent(userQuery)}&mode=1&uid=${userId}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        const { result = "⚠️ Sorry, I couldn't find a result." } = await response.json();

        await message.reply(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━`
        );
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n━━━━━━━━━━━━━━━━\n⚠️ Sorry, I couldn't process your query. Please try again later.\n━━━━━━━━━━━━━━━━`
        );
    }
}

export default {
    config,
    onCall,
};