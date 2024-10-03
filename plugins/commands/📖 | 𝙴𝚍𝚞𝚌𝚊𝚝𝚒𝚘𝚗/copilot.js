const config = {
    name: "copilot",
    aliases: ["copilot", "assistant"],
    description: "Interact with Bing Copilot Ai",
    usage: "[message]",
    cooldown: 3,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userMessage = args.join(" ");

    const header = "✧₊⁺ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n・──────────────・";
    const footer = "・───── >ᴗ< ──────・";

    if (!userMessage) return message.reply(`${header}\nPlease provide a question.\n${footer}`);

    await message.react("🕰️"); // Indicate processing

    const apiUrl = `https://www.samirxpikachu.run.place/bing?message=${encodeURIComponent(userMessage)}&mode=1&uid=23`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("⚠️ Failed to fetch data");

        let result = await response.text(); // API response is plain text

        // Format the fetched response for better readability
        result = result
            .replace(/\\n/g, '\n') // Replace newline characters with actual new lines
            .replace(/\n{2,}/g, '\n\n') // Ensure double new lines between paragraphs
            .trim(); // Remove any unnecessary leading or trailing whitespace

        await message.reply(`${header}\n${result}\n${footer}`); // Send back the result with header and footer
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply(`${header}\n⚠️ An error occurred while fetching the data.\n${footer}`); // Error message with header and footer
    }
}

export default {
    config,
    onCall,
};