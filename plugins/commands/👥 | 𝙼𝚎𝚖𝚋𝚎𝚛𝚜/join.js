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

async function onCall({ message, event, global }) {
    const allowedThreadIDs = [
        "7109055135875814", 
        "7905899339426702", 
        "7188533334598873", 
        "25540725785525846", 
        "26605074275750715"
    ];

    try {
        const groupListPromises = allowedThreadIDs.map(async (tid) => {
            const groupData = await getData(tid);
            return groupData ? { ...groupData, threadID: tid } : null;
        });

        // Fetch group data concurrently
        const groupList = (await Promise.all(groupListPromises)).filter(Boolean);

        if (groupList.length === 0) {
            await message.reply('No group chats found.');
            return;
        }

        // Sort the filtered group list by participant count (descending)
        const sortedList = groupList.sort((a, b) => (b.members?.length || 0) - (a.members?.length || 0));

        // Create a formatted list of groups
        const formattedList = sortedList.map((group, index) =>
            `│${index + 1}. ${group.threadName || "Unknown"}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.members?.length || 0}\n│`
        );

        // Calculate total users across all groups
        const totalUsers = sortedList.reduce((total, group) => total + (group.members?.length || 0), 0);

        // Construct the message to display the list
        const listMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nTo join a group, you should chat:\njoin 1\njoin 2\njoin 3\njoin 4\nand so on...`;

        // Send the list to the user
        await message.reply(listMessage);

    } catch (error) {
        console.error("Error listing group chats", error);
        await message.reply("⚠️ An error occurred while listing group chats.");
    }
}

// New function to handle the joining command
async function handleJoinCommand({ message, args, global }) {
    const groupIndex = parseInt(args[1], 10); // Parse the group number from the command

    if (isNaN(groupIndex) || groupIndex <= 0 || groupIndex > global.groupList.length) {
        await message.reply('Invalid group number. Please choose a valid number.');
        return;
    }

    const selectedGroup = global.groupList[groupIndex - 1]; // Access the global groupList
    const groupID = selectedGroup.threadID;

    try {
        // Retrieve member list using getData function
        const memberList = await getData(groupID);

        if (memberList?.members?.some((member) => member.userID === message.senderID)) {
            await message.reply(`You're already in the group chat: ${selectedGroup.threadName}`);
            return;
        }

        if (memberList?.members?.length >= 250) {
            await message.reply(`The group chat is full: ${selectedGroup.threadName}`);
            return;
        }

        // Add the user to the group (you'll need to implement this part based on how you manage groups)
        await updateInfo(groupID, { participantIDs: [...(memberList.participantIDs || []), message.senderID] });
        await message.reply(`You've joined the group chat: ${selectedGroup.threadName}`);
    } catch (error) {
        console.error("Error joining group chat", error);
        await message.reply("⚠️ An error occurred while trying to join the group.");
    }
}

// Modify the global onReply handler to check for the join command
async function onReply({ message, global }) {
    const command = message.body.split(" ");
    
    if (command[0].toLowerCase() === "join") {
        await handleJoinCommand({ message, args: command, global });
    }
}

export default {
    config,
    onCall,
    onReply,
};