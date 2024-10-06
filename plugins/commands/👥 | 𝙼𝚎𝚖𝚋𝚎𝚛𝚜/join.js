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

// Existing thread IDs and names
const threadData = {
    "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
    "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
    "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
    "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
    "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨"
};

async function onCall({ message, args }) {
    const { api } = global;
    const { author, body } = message;

    // Check if the message is a reply from the user
    if (globalPendingRequests[author]) {
        const availableThreads = globalPendingRequests[author];

        // Parse the user's reply to get the selected thread number
        const selectedNumber = parseInt(body, 10) - 1;

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

                // Handle specific error messages
                if (error.message.includes("already in the group")) {
                    return await message.reply("⚠️ You are already in this group.");
                } else if (error.message.includes("cannot be added")) {
                    return await message.reply("⚠️ You cannot be added to this group at the moment.");
                } else {
                    return await message.reply("⚠️ Failed to join the selected thread. Please try again later.");
                }
            } finally {
                // Clear the pending request for the author
                delete globalPendingRequests[author];
            }
            return; // Exit the function after processing the join request
        } else {
            return message.reply("Invalid selection. Please reply with a valid number.");
        }
    }

    // Create an array of available threads using existing thread data and fetching member counts
    const availableThreads = await Promise.all(
        Object.entries(threadData).map(async ([threadID, name]) => {
            // Fetch the member count for the current thread
            const members = await api.getGroupMembers(threadID); // Assume this function returns the members of the group
            return {
                threadID,
                name,
                membersLength: members.length // Get the number of members in the thread
            };
        })
    );

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
        `𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${getTotalUsers(availableThreads)}`; // Function to calculate total users

    // Send the available threads list to the user
    await message.reply(`${threadListMessage}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...).`);

    // Store the pending request for the author
    globalPendingRequests[author] = availableThreads;

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