const config = {
    name: "ai",
    aliases: ["ai"], // name and alias are the same
    description: "Interact with the GPT-4 Mini API",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ") || "hi"; // Use the user's query or default to "hi"
    const header = "🧋✨ | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n━━━━━━━━━━━━━━━━";
    const footer = "━━━━━━━━━━━━━━━━";

    try {
        const response = await fetch(`https://www.samirxpikachu.run.place/gpt4mini?prompt=${encodeURIComponent(query)}`);
        const data = await response.json();

        if (data.response) {
            await message.send(`${header}\n${data.response}\n${footer}`); // Send the response back to the user with header and footer
        } else {
            await message.send(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error fetching from GPT-4 Mini API:", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};