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
        const threads = await Threads.getAll(); // Fetch threads that the bot is a member of
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
        console.error('Error fetching threads:', error);
        throw new Error("Error listing group chats"); // Error message 1
    }

    return availableThreads;
}

// Reply handler to process user’s thread selection
async function replyHandler({ eventData, message }) {
    const { body, senderID } = message;
    const availableThreads = eventData.availableThreads;

    // Parse the user's reply to get the selected thread number
    const selectedNumber = parseInt(body, 10) - 1;

    if (isNaN(selectedNumber)) {
        return message.reply("Invalid input"); // Error message 3
    }

    if (selectedNumber < 0 || selectedNumber >= availableThreads.length) {
        return message.reply("Invalid group number"); // Error message 4
    }

    const selectedThread = availableThreads[selectedNumber];

    // Ensure senderID is a valid user ID
    if (!senderID) {
        return message.reply("⚠️ Could not retrieve your user ID.");
    }

    try {
        // Attempt to add the user to the selected thread
        await global.api.addUserToGroup(senderID, selectedThread.threadID); 

        // Success message
        await message.reply(`You have been added to the thread: ${selectedThread.name}`);
        await message.react("✔️"); 

    } catch (error) {
        console.error('Error adding user:', error);
        await message.react("✖️"); 

        // Handle specific error messages without using `includes`
        if (error.message === "User already in the group") {
            return message.reply("User already in the group"); // Error message 5
        } else if (error.message === "Group chat is full") {
            return message.reply("Group chat is full"); // Error message 6
        } else if (error.message === "Private chat settings") {
            return message.reply(`Private chat settings\n\nFailed to add you to the group because you have set your chat to private only.\n\n▫Do this to fix it▫\nchat settings > privacy&safety > message delivery > Others > message requests.`); // Error message 8
        } else {
            return message.reply(`Additional error message: ${error.message}`); // Error message 9
        }
    }
}

async function onCall({ message, args }) {
    const { senderID, threadID } = message;

    try {
        // Fetch available threads
        const availableThreads = await getAvailableThreads(threadID);

        if (availableThreads.length === 0) {
            return message.reply("No group chats found"); // Error message 2
        }

        // Create a formatted list of available threads with spaces between each, and remove the extra space above the arrow
        const threadListMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n` +
            availableThreads.map((thread, index) =>
                `│${index + 1}. ${thread.name}\n` +
                `│𝐓𝐈𝐃: ${thread.threadID}\n` +
                `│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${thread.membersLength}`
            ).join('\n│\n') +
            `\n╰───────────ꔪ\n` +
            `𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n` +
            `𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${getTotalUsers(availableThreads)}`;

        // Send the available threads list to the user
        await message.reply(`${threadListMessage}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...).`).then(msg => {
            msg.addReplyEvent({ callback: replyHandler, type: "message", availableThreads });
        });

        await message.react("🕰️"); 

    } catch (error) {
        // Handle the error if something goes wrong during the call
        await message.reply(error.message || "Error joining group chat"); // Error message 7
    }
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