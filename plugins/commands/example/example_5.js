const config = {
    name: "exampledefault2",
    aliases: ["exd2"], // name and alias are same
    description: "This is an example command",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const msgData = await message.send("This is an example message");
    msgData.addReactEvent({ callback: onReaction });
    msgData.addReplyEvent({ callback: onReply });
}

async function onReply({ message }) {
    // Handle reply events
}

async function onReaction({ message }) {
    // Handle reaction events
}

export default {
    config,
    onCall,
};