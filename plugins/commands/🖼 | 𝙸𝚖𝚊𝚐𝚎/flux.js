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

    if (!prompt) {
        return message.reply("Please provide a prompt.");
    }

    try {
        const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}`;

        // Fetching the image stream using axios
        const response = await axios.get(apiUrl, {
            responseType: 'stream' // Ensure response type is stream
        });

        if (response.status !== 200) {
            return message.reply("Failed to retrieve image.");
        }

        return message.reply({
            body: '',
            attachment: response.data // Directly using the stream
        });
    } catch (error) {
        console.error(error);
        return message.reply("⚠️ Failed to retrieve image.");
    }
}

export default {
    config,
    onCall,
};