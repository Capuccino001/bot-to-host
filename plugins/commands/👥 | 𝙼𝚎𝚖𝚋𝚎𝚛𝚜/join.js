const config = {
    name: "join",
    aliases: ["groupjoin"],
    description: "Get the number of groups and add users to a selected group.",
    usage: "[group number]",
    cooldown: 3,
    permissions: [1, 2],  // Updated permissions
    credits: "coffee",
};

// Ensure the global context has the onReply map
if (!global.onReply) {
    global.onReply = new Map();
}

async function onCall({ message, args, Threads }) {
    try {
        // Fetch up to 20 threads (group chats) from the inbox
        const groupList = await Threads.getAll();  // Assuming you fetch all threads here

        if (groupList.length === 0) {
            await message.reply('No group chats available.');
            return;
        }

        if (!args[0]) {
            // Show the list of available groups if no group number is provided
            const formattedList = groupList.map((group, index) => 
                `│${index + 1}. ${group.name}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐌𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}`
            );

            const totalGroups = groupList.length;
            const totalUsers = groupList.reduce((total, group) => total + group.participantIDs.length, 0);

            const responseMessage = `𝐆𝐫𝐨𝐮𝐩 𝐈𝐧𝐟𝐨:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐓𝐨𝐭𝐚𝐥 𝐆𝐫𝐨𝐮𝐩𝐬: ${totalGroups}\n𝐓𝐨𝐭𝐚𝐥 𝐔𝐬𝐞𝐫𝐬: ${totalUsers}\n\nReply with the group number to add yourself to the group.`;

            await message.reply(responseMessage);

            // Save the groupList to handle replies
            global.onReply.set(message.messageID, {
                commandName: 'join',
                groupList: groupList,
            });
        } else {
            // Handle the user's reply to add them to the group
            const groupIndex = parseInt(args[0], 10);

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

            // Fetch thread info with fallback
            const getThread = (await Threads.get(groupID)) || {};
            const getThreadData = getThread.data || {};
            const getThreadInfo = getThread.info || {};

            const participantIDs = getThreadInfo.participantIDs || [];

            // Check if the user is already in the group
            if (participantIDs.includes(message.senderID)) {
                await message.reply(`You're already in the group chat: ${selectedGroup.name}`);
                return;
            }

            // Check if the group is full (250 members limit)
            if (participantIDs.length >= 250) {
                await message.reply(`The group chat is full: ${selectedGroup.name}`);
                return;
            }

            // Add the user to the group
            await Threads.addUserToGroup(message.senderID, groupID);
            await message.reply(`You've successfully joined the group chat: ${selectedGroup.name}`);
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