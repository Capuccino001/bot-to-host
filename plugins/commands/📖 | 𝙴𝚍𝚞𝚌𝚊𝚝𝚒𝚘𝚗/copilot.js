const config = {
    name: "copilot",
    aliases: ["cp", "bing"],
    description: "Copilot command to interact with Bing API.",
    usage: "[query]",
    cooldown: 3,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userQuery = args.join(" ") || "hello";
    const userId = 100;

    await message.react("🕰️");

    const apiUrl = `https://samirxpikachuio.onrender.com/bing?message=${encodeURIComponent(userQuery)}&mode=1&uid=${userId}`;

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        const { result = "⚠️ Sorry, I couldn't find a result." } = await response.json();

        await message.reply(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚗𝚝\n━━━━━━━━━━━━━━━━\n${result}\n━━━━━━━━━━━━━━━━`
        );
        await message.react("✔️");
    } catch (error) {
        console.error(error);
        await message.react("✖️");
        await message.reply(
            `🌊✨ | 𝙲𝚘𝚙𝚒𝚗𝚝\n━━━━━━━━━━━━━━━━\n⚠️ ${error.message}\n━━━━━━━━━━━━━━━━`
        );
    }
}

export default {
    config,
    onCall,
};