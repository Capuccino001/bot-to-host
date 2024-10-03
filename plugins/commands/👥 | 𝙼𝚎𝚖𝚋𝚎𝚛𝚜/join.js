const config = {
    name: "join",
    aliases: ["groupjoin"],
    description: "Join one of the predefined group chats.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [0], // Set to 0 for owner/admin only
    credits: "Kshitiz/coffee",
};

async function onCall({ message, global, event }) {
    const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
    ];

    try {
        // Use global.api to get the thread list
        const groupList = await global.api.getThreadList(10, null, ['INBOX']);

        // Filter based on allowedThreadIDs
        const filteredList = groupList.filter(group => allowedThreadIDs.includes(group.threadID));

        // Sort the filtered group list by participant count (descending)
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (sortedList.length === 0) {
            await message.reply('No group chats found.');
            return;
        }

        // Create a formatted list of groups
        const formattedList = sortedList.map((group, index) =>
            `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
        );

        // Calculate total users across all groups
        const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

        // Construct the message to display the list
        const listMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)`;

        // Send the list to the user
        const sentMessage = await message.reply(listMessage);

        // Store the reply handler
        global.onReply.set(sentMessage.messageID, {
            commandName: 'join',
            messageID: sentMessage.messageID,
            author: event.senderID,
            groupList: sortedList, // Save the sorted group list for the reply handler
        });

    } catch (error) {
        console.error("Error listing group chats", error);
        await message.reply("⚠️ An error occurred while listing group chats.");
    }
}

async function onReply({ event, Reply, args, global }) {
    const { author, groupList } = Reply;

    if (event.senderID !== author) {
        return; // Ignore if the reply is not from the original user
    }

    const groupIndex = parseInt(args[0], 10);

    if (isNaN(groupIndex) || groupIndex <= 0 || groupIndex > groupList.length) {
        await global.api.sendMessage('Invalid group number. Please choose a valid number.', event.threadID, event.messageID);
        return;
    }

    const selectedGroup = groupList[groupIndex - 1];
    const groupID = selectedGroup.threadID;

    try {
        // Retrieve member list using getThreadInfo
        const memberList = await global.api.getThreadInfo(groupID);

        if (memberList.participantIDs.includes(event.senderID)) {
            await global.api.sendMessage(`You're already in the group chat: ${selectedGroup.threadName}`, event.threadID, event.messageID);
            return;
        }

        if (memberList.participantIDs.length >= 250) {
            await global.api.sendMessage(`The group chat is full: ${selectedGroup.threadName}`, event.threadID, event.messageID);
            return;
        }

        // Add the user to the group
        await global.api.addUserToGroup(event.senderID, groupID);
        await global.api.sendMessage(`You've joined the group chat: ${selectedGroup.threadName}`, event.threadID, event.messageID);
    } catch (error) {
        console.error("Error joining group chat", error);
        await global.api.sendMessage("⚠️ An error occurred while trying to join the group.", event.threadID, event.messageID);
    } finally {
        // Remove the reply handler
        global.onReply.delete(event.messageID);
    }
}

export default {
    config,
    onCall,
    onReply,
};