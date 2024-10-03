const config = {
    name: "prefix",
    aliases: ["pf", "setprefix", "setpf"],
    permissions: [1, 2],
    description: "Set prefix for group",
    usage: "<prefix>",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 5,
    credits: "XaviaTeam"
};

async function onCall({ message, args, data, prefix }) {
    const { isGroup, threadID } = message;
    const { thread } = data;

    if (!isGroup) {
        return message.reply("This command only works in groups.");
    }
    
    if (!thread?.info?.threadID) {
        return message.reply("Thread data does not exist.");
    }
    
    thread.data = thread.data || {};

    if (!args[0]) {
        return message.reply(`Default prefix: ${global.config.PREFIX}\nCurrent prefix: ${prefix}`);
    }

    const newPrefix = args[0];
    if (newPrefix.length > 5) {
        return message.reply("Prefix must be less than 5 characters.");
    }

    await global.controllers.Threads.updateData(threadID, { prefix: newPrefix });
    
    global.api.changeNickname(`[ ${newPrefix} ] ${global.config.NAME || "Xavia"}`, threadID, global.botID, () => {
        message.reply(`Prefix has been set to ${newPrefix}.`);
    });
}

export default {
    config,
    onCall
};