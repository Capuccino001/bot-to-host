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
    const { threadID, author, body } = message;

    // Check if an argument was provided
    if (args.length > 0) {
        const selectedNumber = parseInt(args[0], 10) - 1;

        // Check for valid input and if there's a pending request
        if (!isNaN(selectedNumber) && selectedNumber >= 0 && globalPendingRequests[author] && selectedNumber < globalPendingRequests[author].length) {
            const selectedThread = globalPendingRequests[author][selectedNumber];

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
            return message.reply("Invalid selection. Please provide a valid thread number.");
        }
    }

    // Handle the case when no arguments are provided and fetch available threads
    if (globalPendingRequests[author]) {
        return message.reply("You already have a pending request. Please reply with the thread number or use the command format.");
    }

    const availableThreads = await getAvailableThreads();

    if (availableThreads.length === 0) {
        return message.reply("No available threads to join.");
    }

    // Create a list of available threads with their indexes
    const threadListMessage = availableThreads
        .map((thread, index) => `${index + 1}: ${thread.name} (ID: ${thread.threadID})`)
        .join('\n');

    // Send the available threads list to the user
    await message.reply(`Available threads:\n${threadListMessage}\n\nReply with the number of the thread you want to join, or use the command format (join 1, join 2, etc.).`);

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