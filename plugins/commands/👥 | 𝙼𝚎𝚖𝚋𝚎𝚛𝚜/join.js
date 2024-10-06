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

async function onCall({ message, args, api }) {
    const { threadID, authorID, body } = message;

    // Fetch available threads only if there's no pending request
    const availableThreads = await getAvailableThreads();

    if (availableThreads.length === 0) {
        return api.sendMessage("No available threads to join.", threadID);
    }

    // Create a list of available threads with their indexes
    const threadListMessage = availableThreads
        .map((thread, index) => `${index + 1}: ${thread.name} (ID: ${thread.threadID})`)
        .join('\n');

    // Send the available threads list to the user
    api.sendMessage(`Available threads:\n${threadListMessage}\n\nReply with the number of the thread you want to join.`, threadID);

    // Store the pending request for the author
    globalPendingRequests[authorID] = availableThreads;

    // React to indicate processing
    api.setMessageReaction("🕰️", message.messageID, true);
}

// Handle reply events to process the selected thread number
async function onReply({ message, api }) {
    const { threadID, authorID, body } = message;

    // Check if the user has a pending request
    if (!globalPendingRequests[authorID]) return;

    const availableThreads = globalPendingRequests[authorID];

    // Parse the user's reply to get the selected thread number
    const selectedNumber = parseInt(body.trim(), 10) - 1;

    if (isNaN(selectedNumber) || selectedNumber < 0 || selectedNumber >= availableThreads.length) {
        return api.sendMessage("Invalid selection. Please reply with a valid number.", threadID);
    }

    const selectedThread = availableThreads[selectedNumber];

    // Add the user to the selected thread
    try {
        await api.addUserToGroup(authorID, selectedThread.threadID);
        await api.sendMessage(`You have been added to the thread: ${selectedThread.name}`, threadID);
        await api.setMessageReaction("✔️", message.messageID, true); // React with ✔️ on success
    } catch (error) {
        console.error(error);
        await api.setMessageReaction("✖️", message.messageID, true); // React with ✖️ on error
        await api.sendMessage("⚠️ Failed to join the selected thread. Please try again later.", threadID);
    } finally {
        // Clear the pending request for the author
        delete globalPendingRequests[authorID];
    }
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
    onReply, // Exporting onReply for handling replies
};