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
            return message.reply("Use '-tempmail create' to generate a temporary email or '-tempmail inbox [email]' to retrieve inbox messages.");
        }

        const command = args[0].toLowerCase();

        switch (command) {
            case "create":
                return await createTempEmail(message);
            case "inbox":
                return args.length === 2 ? await checkInbox(message, args[1]) : message.reply("❌ | Please provide an email address for the inbox command.");
            default:
                return message.reply("❌ | Invalid command. Use '-tempmail create' or '-tempmail inbox [email]'.");
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
        return message.reply(`❌ | An unexpected error occurred: ${error.message}`);
    }
}

async function createTempEmail(message) {
    try {
        let email;
        let attempts = 0; // Counter for attempts
        const maxAttempts = 10; // Maximum number of attempts

        // Loop until a valid email is generated or max attempts reached
        do {
            const result = await samirapi.getTempMail();
            email = result.email;
            attempts++;
        } while (!email.endsWith("@rteet.com") && attempts < maxAttempts);

        // If email is generated, send it; otherwise, return an error message
        if (email && email.endsWith("@rteet.com")) {
            return message.reply(`・───── >ᴗ< ──────・\n📩 Generated Email:\n🔹${email}\n・──────────────・`);
        } else {
            throw new Error("Failed to generate a valid email after several attempts.");
        }
    } catch (error) {
        console.error("❌ | Failed to generate email", error.message);
        return message.reply(`❌ | Failed to generate email. Error: ${error.message}`);
    }
}

async function checkInbox(message, email) {
    try {
        const inboxMessages = await samirapi.getInbox(email);
        if (!Array.isArray(inboxMessages) || inboxMessages.length === 0) {
            return message.reply("❌ | No messages found in the inbox.");
        }

        const { date, from, subject } = inboxMessages[0]; // Get the most recent message
        return message.reply(`━━━━━━━━━━━━━━━━\n📬 Inbox messages for ${email}:\n📧 From: ${from}\n📩 Subject: ${subject}\n━━━━━━━━━━━━━━━━`);
    } catch (error) {
        console.error("❌ | Failed to retrieve inbox messages", error.message);
        return message.reply(`❌ | Failed to retrieve inbox messages. Error: ${error.message}`);
    }
}

export default {
    config,
    onCall,
};