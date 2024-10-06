const config = {
    name: "join",
    aliases: ["join"],
    description: "Join a selected thread from the available threads.",
    usage: "[number]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

// Function to get available threads and their member counts dynamically
async function getAvailableThreads() {
    const { Threads } = global.controllers;
    const availableThreads = [];

    // Define thread IDs to check
    const threadIDs = [
        "7109055135875814",
        "7905899339426702",
        "7188533334598873",
        "25540725785525846",
        "26605074275750715",
        "8415996105120983",
    ];

    for (const threadID of threadIDs) {
        const getThread = await Threads.get(threadID);
        if (getThread) {
            const getThreadInfo = getThread.info;
            const membersLength = getThreadInfo?.members?.length || 0; // Get current members length

            availableThreads.push({
                threadID,
                name: getThreadInfo.name || threadID,
                membersLength,
            });
        }
    }

    return availableThreads;
}

// Reply handler to process user’s thread selection
async function replyHandler({ eventData, message }) {
    const { body, senderID } = message; // Use senderID directly
    const availableThreads = eventData.availableThreads;

    // Log the senderID to ensure it is defined
    console.log('Sender ID:', senderID);

    // Parse the user's reply to get the selected thread number
    const selectedNumber = parseInt(body, 10) - 1;

    if (isNaN(selectedNumber) || selectedNumber < 0 || selectedNumber >= availableThreads.length) {
        return message.reply("Invalid selection. Please reply with a valid number.");
    }

    const selectedThread = availableThreads[selectedNumber];

    // Ensure senderID is a valid user ID
    if (!senderID) {
        return message.reply("⚠️ Could not retrieve your user ID.");
    }

    // Log the selected thread info for debugging
    console.log('Selected Thread:', selectedThread);

    // Add the user to the selected thread
    try {
        await global.api.addUserToGroup(senderID, selectedThread.threadID); // Use senderID instead of author
        await message.reply(`You have been added to the thread: ${selectedThread.name}`);
        await message.react("✔️"); // React with ✔️ on success
    } catch (error) {
        console.error('Error adding user:', error);
        await message.react("✖️"); // React with ✖️ on error

        // Handle specific error messages
        if (error.message) {
            return await message.reply(`⚠️ ${error.message}`);
        } else {
            return await message.reply("⚠️ Failed to join the selected thread. Please try again later.");
        }
    }
}

async function onCall({ message, args }) {
    const { api } = global;
    const { senderID } = message;

    // Fetch available threads and their member counts
    const availableThreads = await getAvailableThreads();

    if (availableThreads.length === 0) {
        return message.reply("No available threads to join.");
    }

    // Create a formatted list of available threads
    const threadListMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n` +
        availableThreads.map((thread, index) => 
            `│${index + 1}. ${thread.name}\n` +
            `│𝐓𝐈𝐃: ${thread.threadID}\n` +
            `│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${thread.membersLength}\n` +
            `│`).join('\n') +
        `╰───────────ꔪ\n` +
        `𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n` +
        `𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${getTotalUsers(availableThreads)}`;

    // Send the available threads list to the user and add a reply event
    await message.reply(`${threadListMessage}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...).`).then(msg => {
        msg.addReplyEvent({ callback: replyHandler, type: "message", availableThreads });
    });

    await message.react("🕰️"); // Indicate processing
}

// Helper function to calculate total users across all available threads
function getTotalUsers(threads) {
    return threads.reduce((acc, thread) => acc + thread.membersLength, 0);
}

// Exporting the command
export default {
    config,
    onCall,
};