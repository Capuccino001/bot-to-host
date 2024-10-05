import axios from 'axios';

const config = {
    name: "flux",
    aliases: ["arctic"],
    description: "Image generator",
    usage: "<prompt>",
    cooldown: 5,
    permissions: [0],
    credits: "ArchitectDevs, Contributor: Faith XE | Samir Œ | NS Sakib", // converted by coffee
};

async function onCall({ message, args }) {
    const prompt = args.join(" ");

    await message.react("🕰️");

    if (!prompt) {
        await message.react("✖️");
        return message.reply("Please provide a prompt.");
    }

    try {
        const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}`;

        const response = await axios.get(apiUrl, {
            responseType: 'stream'
        });

        if (response.status !== 200) {
            await message.react("✖️");
            return message.reply("Failed to retrieve image.");
        }

        await message.react("✔️");

        return message.reply({
            body: '',
            attachment: response.data
        });
    } catch (error) {
        console.error(error);
        await message.react("✖️");
        return message.reply(`⚠️ Failed to retrieve image: ${error.message}`);
    }
}

export default {
    config,
    onCall,
};