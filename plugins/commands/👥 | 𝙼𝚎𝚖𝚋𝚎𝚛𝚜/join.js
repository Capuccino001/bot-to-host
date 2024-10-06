import getCThread from '../../core/var/controllers/thread.js'; 

export default {
    config: {
        name: 'join',
        aliases: ['adduser'],
        permissions: [1, 2],
    },

    async onCall({ event, args, database, api }) {
        const { threadID, senderID, messageID } = event;
        const mention = Object.keys(event.mentions)[0];

        // Ensure a user is mentioned
        if (!mention) {
            return api.sendMessage("Please mention a user to add.", threadID, messageID);
        }

        // Fetch the thread controllers from thread.js
        const { getAll } = getCThread(database, api);

        // Fetch the list of threads the bot is a part of
        const allThreads = getAll();
        if (!allThreads || allThreads.length === 0) {
            return api.sendMessage("No threads available for adding users.", threadID, messageID);
        }

        // List all threads for user selection
        let threadListMsg = "Please reply with the number of the thread to add the user:\n";
        allThreads.forEach((thread, index) => {
            if (thread && thread.info && thread.info.threadName) {
                threadListMsg += `${index + 1}. ${thread.info.threadName}\n`;
            }
        });

        // Send the thread list
        api.sendMessage(threadListMsg, threadID, (err, info) => {
            if (err) return console.error(err);

            // Wait for user to reply with the thread number
            global.client.onReply.set(info.messageID, {
                name: this.config.name,
                author: senderID,
                mention,
                messageID: info.messageID,
                allThreads,
                onReply: async function (replyEvent) {
                    const { body } = replyEvent;
                    const selectedThreadIndex = parseInt(body, 10) - 1;
                    if (isNaN(selectedThreadIndex) || selectedThreadIndex < 0 || selectedThreadIndex >= allThreads.length) {
                        return api.sendMessage("Invalid selection. Please try again.", threadID);
                    }

                    const selectedThread = allThreads[selectedThreadIndex];
                    try {
                        // Add the user to the selected thread
                        await api.addUserToGroup(mention, selectedThread.info.threadID);
                        api.sendMessage(`User successfully added to ${selectedThread.info.threadName}!`, threadID);
                    } catch (error) {
                        console.error("Error adding user to group:", error);
                        api.sendMessage("Failed to add the user. Please try again.", threadID);
                    }
                }
            });
        });
    }
};