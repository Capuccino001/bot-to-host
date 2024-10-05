import axios from 'axios';

const config = {
    name: "ai",
    aliases: ["ai"],
    description: "Interact with the GPT-4 API",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const query = args.join(" ") || "hi";

    const header = "(⁠◍⁠•⁠ᴗ⁠•⁠◍⁠) | 𝙼𝚘𝚌𝚑𝚊 𝙰𝚒\n・──────────────・";
    const footer = "・───── >ᴗ< ──────・";

    try {
        const { data } = await axios.get(`https://orc-six.vercel.app/gpt4?ask=${encodeURIComponent(query)}`);
        
        if (data) {
            await message.send(`${header}\n${data}\n${footer}`);
        } else {
            await message.send(`${header}\nSorry, I couldn't get a response from the API.\n${footer}`);
        }
    } catch (error) {
        console.error("Error fetching from GPT-4 API:", error);
        await message.send(`${header}\nAn error occurred while trying to reach the API.\n${footer}`);
    }
}

export default {
    config,
    onCall,
};