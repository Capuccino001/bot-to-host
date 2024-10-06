const config = {
    name: "join",
    aliases: ["join"],
    description: "Get the number of groups and add users to a selected group.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [1, 2], 
    credits: "coffee",
};

// Ensure the global context has the onReply map
if (!global.onReply) {
    global.onReply = new Map();
}

async function onCall({ message, global, args }) {
    if (!global.api) {
        console.error("API is not defined in global context.");
        await message.reply("⚠️ An error occurred: API is not available.");
        return;
    }

    try {
        // Fetch up to 20 threads (group chats) from the inbox
        const groupList = await global.api.getThreadList(20, null, ['INBOX']);
        
        if (groupList.length === 0) {
            await message.reply('No group chats available.');
            return;
        }

        if (!args[0]) {
            // Show the list of available groups if no group number is provided
            const formattedList = groupList.map((group, index) => 
                `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}`
            );
            
            const totalGroups = groupList.length;
            const totalUsers = groupList.reduce((total, group) => total + group.participantIDs.length, 0);

            const responseMessage = `𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${totalGroups}\n𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${totalUsers}\n\nReply with the group number to add yourself to the group.`;

            await message.reply(responseMessage);

            // Save the groupList to handle replies
            global.onReply.set(message.messageID, {
                commandName: 'groups',
                groupList: groupList,
            });
        } else {
            // Handle the user's reply to add them to the group
            const groupIndex = parseInt(args[0], 10);

            const replyData = global.onReply.get(message.messageID);
            if (!replyData || replyData.commandName !== 'groups') {
                await message.reply('Please request the group list first by typing `groups`.');
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

            // Check if the user is already in the group
            if (memberList.participantIDs.includes(message.senderID)) {
                await message.reply(`You're already in the group chat: ${selectedGroup.threadName}`);
                return;
            }

            // Check if the group is full (250 members limit)
            if (memberList.participantIDs.length >= 250) {
                await message.reply(`The group chat is full: ${selectedGroup.threadName}`);
                return;
            }

            // Add the user to the group
            await global.api.addUserToGroup(message.senderID, groupID);
            await message.reply(`You've successfully joined the group chat: ${selectedGroup.threadName}`);
        }
    } catch (error) {
        console.error("Error managing group chats", error);
        await message.reply("⚠️ An error occurred while managing group chats.");
    }
}

export default {
    config,
    onCall,
};