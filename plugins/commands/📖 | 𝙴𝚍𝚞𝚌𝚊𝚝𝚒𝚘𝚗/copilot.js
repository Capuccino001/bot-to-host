import samirapi from 'samirapi';

const config = {
    name: "copilot",
    aliases: ["askcopilot"],
    description: "Ask Copilot AI a question.",
    usage: "[query]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const userId = message.senderID;

    const header = "✧₊⁺ | 𝙲𝚘𝚙𝚒𝚕𝚘𝚝\n・──────────────・\n";
    const footer = "\n・───── >ᴗ< ──────・";

    // Default query is "hi" if args are empty
    const query = args.join(" ") || "hi";

    try {
        await message.react("🕰️");
        const stopTypingIndicator = global.api.sendTypingIndicator(message.threadID);
        const response = await samirapi.bing({ message: query, mode: "creative", uid: userId });

        stopTypingIndicator();

        console.log("API response: ", response);

        if (response) {
            await message.send(`${header}${response}${footer}`);
            await message.react("✔️");
        } else {
            await message.send(`${header}⚠️ No response received from Copilot AI.${footer}`);
        }
    } catch (error) {
        console.error("API call failed: ", error);
        await message.react("❌");
        await message.send(`${header}⚠️ Sorry, I couldn't execute the command. Please try again later.${footer}`);
    }
}

export default {
    config,
    onCall,
};