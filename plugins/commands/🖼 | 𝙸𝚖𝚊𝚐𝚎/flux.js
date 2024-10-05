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
    let prompt = args.join(" ");

    if (!prompt) {
        return message.reply("Please provide a prompt.");
    }

    try {
        const apiUrl = `https://www.samirxpikachu.run.place/arcticfl?prompt=${encodeURIComponent(prompt)}`;

        const imageStream = await global.utils.getStreamFromURL(apiUrl);

        if (!imageStream) {
            return message.reply("Failed to retrieve image.");
        }

        return message.reply({
            body: '',
            attachment: imageStream
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
