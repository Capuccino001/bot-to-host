const config = {
    name: "join",
    aliases: ["join"],
    description: "Allows users to join specific group chats by replying to a list of groups.",
    usage: "[number]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "Kshitiz/Coffee",
    version: "2.0",
    category: "owner"
};

async function onCall({ api, message, event }) {
    try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);

        // Only include specific threadIDs in the list
        const allowedThreadIDs = [
            "7109055135875814",
            "7905899339426702",
            "7188533334598873",
            "25540725785525846",
            "26605074275750715"
        ];

        const filteredList = groupList.filter(group =>
            allowedThreadIDs.includes(group.threadID)
        );

        // Sort filteredList based on the number of participants (from most to least)
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (sortedList.length === 0) {
            await message.send('No group chats found.');
        } else {
            const formattedList = sortedList.map((group, index) =>
                `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
            );

            // Calculate total users across all groups
            const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

            const messageContent = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)`;

            const sentMessage = await message.send(messageContent);
            
            // Add reply event
            sentMessage.addReplyEvent({
                messageID: sentMessage.messageID,
                callback: onReply
            });
        }
    } catch (error) {
        console.error("Error listing group chats", error);
    }
}

async function onReply({ api, message, event, args }) {
    const groupIndex = parseInt(args[0], 10);

    if (isNaN(groupIndex) || groupIndex <= 0) {
        await message.send('Invalid input.\nPlease provide a valid number.');
        return;
    }

    try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);
        const allowedThreadIDs = [
            "7109055135875814",
            "7905899339426702",
            "7188533334598873",
            "25540725785525846",
            "26605074275750715"
        ];

        const filteredList = groupList.filter(group =>
            allowedThreadIDs.includes(group.threadID)
        );

        // Sort filteredList based on the number of participants (from most to least)
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (groupIndex > sortedList.length) {
            await message.send('Invalid group number.\nPlease choose a number within the range.');
            return;
        }

        const selectedGroup = sortedList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        // Check if the user is already in the group
        const memberList = await api.getThreadInfo(groupID);
        if (memberList.participantIDs.includes(event.senderID)) {
            await message.send(`Can't add you, you are already in the group chat: \n${selectedGroup.threadName}`);
            return;
        }

        // Check if group is full
        if (memberList.participantIDs.length >= 250) {
            await message.send(`Can't add you, the group chat is full: \n${selectedGroup.threadName}`);
            return;
        }

        await api.addUserToGroup(event.senderID, groupID);
        await message.send(`You have joined the group chat: ${selectedGroup.threadName}`);
    } catch (error) {
        console.error("Error joining group chat", error);

        let errorMessage = 'Failed to add you to the group because you have set your chat to private only.\n\n▫Do this to fix it▫\nchat settings > privacy&safety > message delivery > Others > message requests.';

        if (error.response && error.response.error) {
            errorMessage += `\nError: ${error.response.error}`;
        }

        await message.send(errorMessage);
    }
}

export default {
    config,
    onCall,
    onReply
};