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
async function getAvailableThreads(threadID) {
    const { Threads } = global.controllers;
    const availableThreads = [];

    try {
        // Fetch threads that the bot is a member of
        const threads = await Threads.getAll(); // Adjust this if necessary based on your API
        for (const thread of threads) {
            if (thread.threadID !== threadID) { // Exclude the current thread
                const membersLength = thread.info?.members?.length || 0; // Get current members length

                availableThreads.push({
                    threadID: thread.threadID,
                    name: thread.info.name || thread.threadID,
                    membersLength,
                });
            }
        }
    } catch (error) {
        console.error("Error listing group chats", error);
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

    if (isNaN(selectedNumber)) {
        return message.reply('Invalid input.\nPlease provide a valid number.');
    }

    if (selectedNumber < 0 || selectedNumber >= availableThreads.length) {
        return message.reply('Invalid group number.\nPlease choose a number within the range.');
    }

    const selectedThread = availableThreads[selectedNumber];

    // Ensure senderID is a valid user ID
    if (!senderID) {
        return message.reply("⚠️ Could not retrieve your user ID.");
    }

    // Log the selected thread info for debugging
    console.log('Selected Thread:', selectedThread);

    // Check if user is already in the group
    if (selectedThread.membersLength >= 250) { // Adjust based on your group limit
        return message.reply(`Can't add you, the group chat is full: \n${selectedThread.name}`);
    }

    try {
        await global.api.addUserToGroup(senderID, selectedThread.threadID); // Use senderID instead of author
        await message.reply(`You have been added to the thread: ${selectedThread.name}`);
        await message.react("✔️"); // React with ✔️ on success
    } catch (error) {
        console.error("Error joining group chat", error);

        // Handle specific error messages
        if (error.message) {
            if (error.message.includes('already in group')) { // Adjust condition based on your API response
                return await message.reply(`Can't add you, you are already in the group chat: \n${selectedThread.name}`);
            } else if (error.message.includes('private chat settings')) { // Adjust condition based on your API response
                return await message.reply(`Failed to add you to the group because you have set your chat to private only.\n\n▫Do this to fix it▫\nchat settings > privacy&safety > message delivery > Others > message requests.`);
            } else if (error.response?.error) {
                return await message.reply(`Error: ${error.response.error}`);
            } else {
                return await message.reply("⚠️ Failed to join the selected thread. Please try again later.");
            }
        } else {
            return await message.reply("⚠️ An unknown error occurred. Please try again.");
        }
    }
}

async function onCall({ message, args }) {
    const { api } = global;
    const { senderID, threadID } = message;

    // Fetch available threads and their member counts
    const availableThreads = await getAvailableThreads(threadID);

    if (availableThreads.length === 0) {
        return message.reply('No group chats found.');
    }

    // Create a formatted list of available threads
    const threadListMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n` +
        availableThreads.map((thread, index) => 
            `│${index + 1}. ${thread.name}\n` +
            `│𝐓𝐈𝐃: ${thread.threadID}\n` +
            `│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${thread.membersLength}\n` +
            (index === availableThreads.length - 1 ? `│` : `│\n`) // No extra space for the last group detail
        ).join('\n') +
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