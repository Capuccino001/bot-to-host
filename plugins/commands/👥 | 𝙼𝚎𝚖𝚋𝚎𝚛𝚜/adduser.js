const config = {
    name: "adduser",
    aliases: ["add"],
    description: "Add user to group",
    usage: "[uid]",
    cooldown: 3,
    permissions: [0],
    credits: "XaviaTeam",
};

function adduser(userID, threadID) {
    return new Promise((resolve, reject) => {
        global.api.addUserToGroup(userID, threadID, true, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function onCall({ message, args, reply }) {
    if (!message.isGroup) return;
    const { threadID, senderID } = message;
    try {
        const input = args[0]?.toLowerCase();

        if (!input) return reply("You have not entered the ID of the person to add to the group.");

        let uid = input;
        if (isNaN(uid)) return reply("ID is invalid.");

        if (uid == global.botID) return reply("The bot cannot add itself to the group.");
        if (uid == senderID) return reply("You cannot use this command to add yourself to the group.");

        await adduser(uid, threadID);
        reply("User added to the group successfully.");
    } catch (e) {
        console.error(e);
        return reply("An error has occurred, please try again later.");
    }
}

export default {
    config,
    onCall,
};
