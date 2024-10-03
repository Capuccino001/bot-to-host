const config = {
    name: "join",
    aliases: ["groupjoin"],
    description: "Join one of the predefined group chats.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [0], // Set to 0 for owner/admin only
    credits: "Kshitiz/coffee",
};

// Ensure global.onReply is initialized as a Map if it isn't already
if (!global.onReply) {
    global.onReply = new Map();
}

async function onCall({ message, args, global }) {
    const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
    ];

    // Case 1: If the user just types `join`, list available groups
    if (args.length === 0) {
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
            const listMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nTo join a group, type:\njoin 1\njoin 2\njoin 3\njoin 4\n...and so on.`;

            // Send the list to the user
            await message.reply(listMessage);

            // Store the sorted group list for future use
            global.onReply.set(message.messageID, {
                commandName: 'join',
                groupList: sortedList, // Save the sorted group list for processing joins
            });

        } catch (error) {
            console.error("Error listing group chats", error);
            await message.reply("⚠️ An error occurred while listing group chats.");
        }
        return;
    }

    // Case 2: If the user types `join [number]`, process the request to join the group
    const groupIndex = parseInt(args[0], 10);

    if (isNaN(groupIndex) || groupIndex <= 0) {
        await message.reply('Invalid format. To join a group, use `join [number]`.');
        return;
    }

    try {
        // Retrieve the group list from the previous response (if any)
        const replyData = global.onReply.get(message.messageID);
        if (!replyData || replyData.commandName !== 'join') {
            await message.reply("Please list the available groups first using the `join` command.");
            return;
        }

        const { groupList } = replyData;

        if (groupIndex > groupList.length) {
            await message.reply(`Invalid group number. Please choose a valid number between 1 and ${groupList.length}.`);
            return;
        }

        const selectedGroup = groupList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        // Retrieve member list using getThreadInfo
        const memberList = await global.api.getThreadInfo(groupID);

        if (memberList.participantIDs.includes(message.senderID)) {
            await message.reply(`You're already in the group chat: ${selectedGroup.threadName}`);
            return;
        }

        if (memberList.participantIDs.length >= 250) {
            await message.reply(`The group chat is full: ${selectedGroup.threadName}`);
            return;
        }

        // Add the user to the group
        await global.api.addUserToGroup(message.senderID, groupID);
        await message.reply(`You've joined the group chat: ${selectedGroup.threadName}`);

    } catch (error) {
        console.error("Error joining group chat", error);
        await message.reply("⚠️ An error occurred while trying to join the group.");
    } finally {
        // Remove the reply handler
        global.onReply.delete(message.messageID);
    }
}

export default {
    config,
    onCall,
};