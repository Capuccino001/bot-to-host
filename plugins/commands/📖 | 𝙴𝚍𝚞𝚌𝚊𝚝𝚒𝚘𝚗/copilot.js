const config = {
    name: "copilot",
    aliases: ["copilot"],
    description: "Fetch a response from Deku API.",
    usage: "[prompt]",
    cooldown: 3,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userPrompt = args.join(" ");

    // Header message
    const header = "✧₊⁺ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n・──────────────・";
    const footer = "・───── >ᴗ< ──────・";

    if (!userPrompt) {
        return message.reply(`${header}\nPlease provide a question.\n${footer}`);
    }

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://deku-rest-api.ooguy.com/api/copilot?prompt=${encodeURIComponent(userPrompt)}&uid=2`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        if (!data.status) {
            return message.reply(`${header}\nAn error occurred while fetching the data.\n${footer}`);
        }

        const result = data.result || "Sorry, I couldn't find a result.";
        await message.reply(`${header}\n${result}\n${footer}`); // Send back the result
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply(`${header}\nAn error occurred while fetching the data.\n${footer}`); // Error message
    }
}

export default {
    config,
    onCall,
};