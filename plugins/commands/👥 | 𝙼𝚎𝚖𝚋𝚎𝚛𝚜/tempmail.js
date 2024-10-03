import samirapi from "samirapi";

const config = {
    name: "tempmail",
    aliases: ["tmpmail", "mail"],
    description: "Generate a temporary email address or check the inbox of a temporary email.",
    usage: "[create/inbox] [email]",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 5,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

async function onCall({ message, args }) {
    try {
        if (args.length === 0) {
            return message.send("Use '-tempmail create' to generate a temporary email or '-tempmail inbox [email]' to retrieve inbox messages.");
        }

        const command = args[0].toLowerCase();

        switch (command) {
            case "create":
                return await createTempEmail(message);
            case "inbox":
                return args.length === 2 ? await checkInbox(message, args[1]) : message.send("❌ | Please provide an email address for the inbox command.");
            default:
                return message.send("❌ | Invalid command. Use '-tempmail create' or '-tempmail inbox [email]'.");
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
        return message.send(`❌ | An unexpected error occurred: ${error.message}`);
    }
}

async function createTempEmail(message) {
    try {
        const { email } = await samirapi.getTempMail();
        if (!email) {
            throw new Error("Email not generated.");
        }
        return message.send(`━━━━━━━━━━━━━━━━\n📩 Generated Email:\n ${email}\n━━━━━━━━━━━━━━━━`);
    } catch (error) {
        console.error("❌ | Failed to generate email", error.message);
        return message.send(`❌ | Failed to generate email. Error: ${error.message}`);
    }
}

async function checkInbox(message, email) {
    try {
        const inboxMessages = await samirapi.getInbox(email);
        if (!Array.isArray(inboxMessages) || inboxMessages.length === 0) {
            return message.send("❌ | No messages found in the inbox.");
        }

        const { date, from, subject } = inboxMessages[0]; // Get the most recent message
        return message.send(`━━━━━━━━━━━━━━━━\n📬 Inbox messages for ${email}:\n📧 From: ${from}\n📩 Subject: ${subject}\n📅 Date: ${date}\n━━━━━━━━━━━━━━━━`);
    } catch (error) {
        console.error("❌ | Failed to retrieve inbox messages", error.message);
        return message.send(`❌ | Failed to retrieve inbox messages. Error: ${error.message}`);
    }
}

export default {
    config,
    onCall,
};