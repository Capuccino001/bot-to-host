const config = {
    name: "join",
    aliases: ["joinGroup", "joinThread"],
    description: "Join a specified group or thread.",
    usage: "[thread ID]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

async function onCall({ message, args }) {
    const threadID = args[0]; // Assume the first argument is the thread ID

    if (!threadID) {
        // No thread ID provided, list available threads to join
        const availableThreads = await global.controllers.Threads.getAvailableThreads(); // Example: This function should return available threads

        if (!availableThreads || availableThreads.length === 0) {
            return message.reply("⚠️ No available threads to join.");
        }

        // Build a list of threads with corresponding numbers
        const threadList = availableThreads
            .map((thread, index) => `${index + 1}. ${thread.threadName || thread.id}`)
            .join("\n");

        // Ask the user to reply with the thread number
        await message.reply(`Please reply with the number of the thread you'd like to join:\n${threadList}`);

        // Wait for the user to reply with a number
        const filter = (response) => response.sender.id === message.sender.id && /^\d+$/.test(response.body);
        const collected = await global.controllers.Messages.awaitMessage(filter, { time: 30000 }); // 30 seconds to reply

        if (!collected) {
            return message.reply("⚠️ No response received. Please try the command again.");
        }

        const threadIndex = parseInt(collected.body, 10) - 1;

        if (threadIndex < 0 || threadIndex >= availableThreads.length) {
            return message.reply("⚠️ Invalid thread number. Please try again.");
        }

        const selectedThreadID = availableThreads[threadIndex].id;

        // Continue to join the selected thread
        await joinThread(message, selectedThreadID);
    } else {
        // If a thread ID was provided, proceed to join that thread directly
        await joinThread(message, threadID);
    }
}

// Helper function to handle the joining process
async function joinThread(message, threadID) {
    await message.react("🕰️"); // Indicate processing

    try {
        // Fetch thread info from the API
        const threadInfo = await global.controllers.Threads.getInfoAPI(threadID);

        if (!threadInfo) {
            await message.react("✖️"); // React with ❎ on error
            return message.reply("⚠️ Failed to retrieve thread information.");
        }

        // Update user data to add this thread
        const userID = message.sender.id;
        const userInfo = await global.controllers.Users.getInfo(userID);

        if (!userInfo) {
            await message.react("✖️");
            return message.reply("⚠️ User information could not be retrieved.");
        }

        // Add user to the thread
        await global.controllers.Threads.updateInfo(threadID, {
            participantIDs: [...(threadInfo.participantIDs || []), userID],
        });

        await message.reply(`✅ You have successfully joined the thread: ${threadInfo.threadName || threadID}`);
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while trying to join the thread.");
    }
}

export default {
    config,
    onCall,
};