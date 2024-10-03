const config = {
    name: "join",
    aliases: [],
    version: "2.0",
    cooldown: 3,
    permissions: [0],
    description: "Join a specific group from the allowed list",
    credits: "XaviaTeam",
    extra: {
        allowedThreadIDs: [
            "7109055135875814",
            "7905899339426702",
            "7188533334598873",
            "25540725785525846",
            "26605074275750715"
        ]
    }
};

const langData = {
    "en": {
        "noGroups": "No group chats found.",
        "groupListMessage": "List of group chats:\n╭─╮\n{list}\n╰───────────ꔪ\nMaximum Members = 250\nOverall Users = {totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)",
        "invalidInput": "Invalid input. Please provide a valid number.",
        "groupFull": "Can't add you, the group chat is full: \n{groupName}",
        "alreadyInGroup": "Can't add you, you are already in the group chat: \n{groupName}",
        "groupJoinSuccess": "You have joined the group chat: {groupName}",
        "privateChatError": "Failed to add you to the group because you have set your chat to private only. \n▫ Do this to fix it ▫\nchat settings > privacy&safety > message delivery > Others > message requests."
    }
};

/** @type {TOnCallCommand} */
async function onCall({ api, event, getLang, extra, message }) {
    try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);
        const allowedThreadIDs = extra.allowedThreadIDs;

        const filteredList = groupList.filter(group => allowedThreadIDs.includes(group.threadID));
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (sortedList.length === 0) {
            return message.send(getLang("noGroups"), event.threadID);
        }

        const formattedList = sortedList.map((group, index) =>
            `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
        );
        const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

        const groupListMessage = getLang("groupListMessage")
            .replace("{list}", formattedList.join("\n"))
            .replace("{totalUsers}", totalUsers);

        const sentMessage = await message.send(groupListMessage, event.threadID);
        
        message.replyData.set(sentMessage.messageID, {
            commandName: 'join',
            messageID: sentMessage.messageID,
            author: event.senderID,
        });
    } catch (error) {
        console.error("Error listing group chats", error);
    }
}

/** @type {TReplyCallback} */
async function onReply({ api, event, Reply, args, getLang, extra, message }) {
    const { author } = Reply;

    if (event.senderID !== author) return;

    const groupIndex = parseInt(args[0], 10);
    if (isNaN(groupIndex) || groupIndex <= 0) {
        return message.send(getLang("invalidInput"), event.threadID, event.messageID);
    }

    try {
        const groupList = await api.getThreadList(10, null, ['INBOX']);
        const allowedThreadIDs = extra.allowedThreadIDs;

        const filteredList = groupList.filter(group => allowedThreadIDs.includes(group.threadID));
        const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

        if (groupIndex > sortedList.length) {
            return message.send(getLang("invalidInput"), event.threadID, event.messageID);
        }

        const selectedGroup = sortedList[groupIndex - 1];
        const groupID = selectedGroup.threadID;

        const memberList = await api.getThreadInfo(groupID);
        if (memberList.participantIDs.includes(event.senderID)) {
            return message.send(getLang("alreadyInGroup").replace("{groupName}", selectedGroup.threadName), event.threadID, event.messageID);
        }

        if (memberList.participantIDs.length >= 250) {
            return message.send(getLang("groupFull").replace("{groupName}", selectedGroup.threadName), event.threadID, event.messageID);
        }

        await api.addUserToGroup(event.senderID, groupID);
        message.send(getLang("groupJoinSuccess").replace("{groupName}", selectedGroup.threadName), event.threadID, event.messageID);
    } catch (error) {
        console.error("Error joining group chat", error);
        message.send(getLang("privateChatError"), event.threadID, event.messageID);
    } finally {
        message.replyData.delete(event.messageID);
    }
}

export default {
    config,
    langData,
    onCall,
    onReply
};