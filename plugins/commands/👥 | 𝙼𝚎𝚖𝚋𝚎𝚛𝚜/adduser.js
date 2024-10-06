const config = {
    name: "adduser",
    aliases: ["add"],
    description: "Add user to group",
    usage: "[uid]",
    cooldown: 3,
    permissions: [0],
    credits: "XaviaTeam",
};

const adduser = (userID, threadID) => {
    return new Promise((resolve, reject) => {
        global.api.addUserToGroup(userID, threadID, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
};

const onCall = async ({ message, args, data }) => {
    if (!message.isGroup) return;

    const { threadID, senderID, reply } = message;
    const input = args[0];

    if (!input || isNaN(input)) {
        return reply("You have not entered a valid user ID (uid) to add to the group.");
    }

    const { adminIDs } = data.thread.info;
    if (!adminIDs.includes(global.botID)) {
        return reply("The bot needs group administration rights to perform this command.");
    }

    const uid = input;

    if (uid === global.botID) return reply("The bot cannot add itself to the group.");
    if (uid === senderID) return reply("You cannot use this command to add yourself to the group.");

    try {
        await adduser(uid, threadID);
        return reply("User added successfully.");
    } catch (e) {
        console.error(e);
        return reply("An error has occurred, please try again later.");
    }
};

export default {
    config,
    onCall,
};