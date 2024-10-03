const config = {
    name: "join",
    aliases: ["groupjoin"],
    description: "Join one of the predefined group chats.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [0], // Set to 0 for owner/admin only
    credits: "Kshitiz/coffee",
};

async function onCall({ message, args, global, event }) {
    const { api } = global;
    const userQuery = args.join(" ");
    const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
    ];

    if (!userQuery) {
        await message.reply("Please provide the group number you want to join.");
        return;
    }

    const groupIndex = parseInt(userQuery, 10);

    if (isNaN(groupIndex) || groupIndex <= 0) {
        await message.reply('Invalid input. Please provide a valid group number.');
        return;
    }

    try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);
        const filteredList = groupList.filter(group => allowedThreadIDs.includes(group.threadID));
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (groupIndex > sortedList.length) {
            await message.reply('Invalid group number. Please choose a number within the range.');
            return;
        }

        const selectedGroup = sortedList[groupIndex - 1];
        const groupID = selectedGroup.threadID;
        const memberList = await api.getThreadInfo(groupID);

        if (memberList.participantIDs.includes(event.senderID)) {
            await message.reply(`You're already in the group chat: ${selectedGroup.threadName}`);
            return;
        }

        if (memberList.participantIDs.length >= 250) {
            await message.reply(`The group chat is full: ${selectedGroup.threadName}`);
            return;
        }

        await api.addUserToGroup(event.senderID, groupID);
        await message.reply(`You've joined the group chat: ${selectedGroup.threadName}`);
    } catch (error) {
        console.error(error);
        await message.reply("⚠️ An error occurred while trying to join the group.");
    }
}

export default {
    config,
    onCall,
};