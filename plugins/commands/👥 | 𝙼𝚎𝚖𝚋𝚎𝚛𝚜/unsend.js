const config = {
    name: "unsend",
    aliases: ["unsend"],
    description: "Unsend the bot's message",
    usage: "[reply]",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam",
};

async function onCall({ message }) {
    try {
        // Check if the message is a reply to the bot's message
        if (message.type !== "message_reply") {
            return message.reply("You must reply to the bot's message.");
        }

        if (message.messageReply?.senderID !== global.botID) {
            return message.reply("The message you replied to is not from the bot.");
        }

        const targetMessageID = message.messageReply.messageID;

        // Attempt to unsend the message
        await global.api.unsendMessage(targetMessageID);
        message.react("✅");
    } catch (error) {
        console.error("Error unsending message:", error);
        return message.reply("❌ | An error occurred while trying to unsend the message.");
    }
}

export default {
    config,
    onCall,
};