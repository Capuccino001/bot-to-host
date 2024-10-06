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

    // Check if the message is a reply from the user
    if (message.type === "message_reply") {
        // Check if the replied message is from the bot
        if (message.messageReply?.senderID !== global.botID) {
            return message.reply("You must reply to the bot's message with the available threads.");
        }

        // Get the user's previous threads from the pending requests
        const availableThreads = globalPendingRequests[author];

        // Parse the user's reply to get the selected thread number
        const selectedNumber = parseInt(body, 10) - 1;

        if (availableThreads && !isNaN(selectedNumber) && selectedNumber >= 0 && selectedNumber < availableThreads.length) {
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
    const replyMessage = await message.reply(`Available threads:\n${threadListMessage}\n\nReply with the number of the thread you want to join.`);

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