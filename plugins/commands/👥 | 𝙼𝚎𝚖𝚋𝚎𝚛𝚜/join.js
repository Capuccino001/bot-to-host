const config = {
    name: "join",
    aliases: ["join"],
    description: "Join a selected thread from the available threads.",
    usage: "[number]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

const globalPendingRequests = {};

async function onCall({ message, args }) {
    const { api } = global;
    const { threadID, author, body, messageReply } = message;

    // Check if the reply is to a message sent by the bot
    if (messageReply && messageReply.senderID !== global.botID) {
        return message.reply("The message you replied to is not from the bot.");
    }

    // Check if the message is a reply from the user
    if (globalPendingRequests[author]) {
        const availableThreads = globalPendingRequests[author];

        // Parse the user's reply to get the selected thread number
        const selectedNumber = parseInt(body.trim(), 10) - 1; // Ensure body is trimmed

        if (!isNaN(selectedNumber) && selectedNumber >= 0 && selectedNumber < availableThreads.length) {
            const selectedThread = availableThreads[selectedNumber];

            // Add the user to the selected thread
            try {
                await api.addUserToGroup(author, selectedThread.threadID);
                await message.reply(`You have been added to the thread: ${selectedThread.name}`);
                await message.react("✔️"); // React with ✅ on success
            } catch (error) {
                console.error(error);
                await message.react("✖️"); // React with ❎ on error
                await message.reply("⚠️ Failed to join the selected thread. Please try again later.");
            } finally {
                // Clear the pending request for the author
                delete globalPendingRequests[author];
            }
            return; // Exit the function after processing the join request
        } else {
            return message.reply("Invalid selection. Please reply with a valid number.");
        }
    }

    // Fetch available threads only if there's no pending request
    const availableThreads = await getAvailableThreads();

    if (availableThreads.length === 0) {
        return message.reply("No available threads to join.");
    }

    // Create a list of available threads with their indexes
    const threadListMessage = availableThreads
        .map((thread, index) => `${index + 1}: ${thread.name} (ID: ${thread.threadID})`)
        .join('\n');

    // Send the available threads list to the user
    await message.reply(`Available threads:\n${threadListMessage}\n\nReply with the number of the thread you want to join.`);

    // Store the pending request for the author
    globalPendingRequests[author] = availableThreads;

    await message.react("🕰️"); // Indicate processing
}

// Helper function to fetch available threads
async function getAvailableThreads() {
    const { Threads } = global.controllers;
    const allThreads = await Threads.getAll(); // This should return an array of all threads
    return allThreads.filter(thread => !thread.isSubscribed); // Filter out already subscribed threads
}

// Exporting the command
export default {
    config,
    onCall,
};