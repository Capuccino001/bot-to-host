const config = {
    name: "tid",
    aliases: ["threadid"],
    version: "1.0.0",
    description: "Provides the thread ID",
    usage: "",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    credits: "XaviaTeam", // Replace "Your Name" with a specific credit if needed
};

async function onCall({ message }) {
    try {
        // Send the thread ID back as a reply
        return message.reply(`Thread ID: ${message.threadID}`);
    } catch (error) {
        console.error("❌ | Error in tid command:", error.message);
        return message.reply("❌ | An error occurred while retrieving the thread ID.");
    }
}

export default {
    config,
    onCall,
};