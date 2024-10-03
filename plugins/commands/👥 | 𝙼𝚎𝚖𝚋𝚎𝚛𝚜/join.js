const config = {
    name: "join",
    aliases: ["groupjoin"],
    description: "Join one of the predefined group chats or get a list of available groups.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [0], // Only allow admins or the owner to use this
    credits: "Kshitiz/coffee",
};

// Make sure global.onReply exists
if (!global.onReply) {
    global.onReply = new Map();
}

async function onCall({ message, global, args }) {
    if (!global.api) {
        console.error("API is not defined in global context.");
        await message.reply("⚠️ An error occurred: API is not available.");
        return;
    }

    const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
    ];

    if (!args[0]) {
        // If no number is specified, show the group list
        try {
            const groupList = await global.api.getThreadList(10, null, ['INBOX']);
            const filteredList = groupList.filter(group => allowedThreadIDs.includes(group.threadID));

            if (filteredList.length === 0) {
                await message.reply('No group chats available.');
                return;
            }

            const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);
            const formattedList = sortedList.map((group, index) =>
                `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}`
            );
            const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

            const listMessage = `𝐀𝐯𝐚𝐢𝐥𝐚𝐛𝐥𝐞 𝐆𝐫𝐨𝐮𝐩𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬: ${totalUsers}\n\n𝐓𝐨 𝐣𝐨𝐢𝐧 𝐚 𝐠𝐫𝐨𝐮𝐩, 𝐜𝐡𝐚𝐭:\njoin 1\njoin 2\njoin 3\n...`;

            await message.reply(listMessage);

            global.onReply.set(message.messageID, {
                commandName: 'join',
                groupList: sortedList,
            });
        } catch (error) {
            console.error("Error listing group chats", error);
            await message.reply("⚠️ An error occurred while listing group chats.");
        }
    } else {
        // If a number is specified, handle joining a group
        const groupIndex = parseInt(args[0], 10);

        try {
            const replyData = global.onReply.get(message.messageID);
            if (!replyData || replyData.commandName !== 'join') {
                await message.reply('Please request the group list first by typing `join`.');
                return;
            }

            const { groupList } = replyData;

            if (isNaN(groupIndex) || groupIndex <= 0 || groupIndex > groupList.length) {
                await message.reply('Invalid group number. Please choose a valid number.');
                return;
            }

            const selectedGroup = groupList[groupIndex - 1];
            const groupID = selectedGroup.threadID;

            const memberList = await global.api.getThreadInfo(groupID);

            if (memberList.participantIDs.includes(message.senderID)) {
                await message.reply(`You're already in the group chat: ${selectedGroup.threadName}`);
                return;
            }

            if (memberList.participantIDs.length >= 250) {
                await message.reply(`The group chat is full: ${selectedGroup.threadName}`);
                return;
            }

            await global.api.addUserToGroup(message.senderID, groupID);
            await message.reply(`You've successfully joined the group chat: ${selectedGroup.threadName}`);
        } catch (error) {
            console.error("Error joining group chat", error);
            await message.reply("⚠️ An error occurred while trying to join the group.");
        }
    }
}

export default {
    config,
    onCall,
};