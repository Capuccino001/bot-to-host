const config = {
    name: "adduser",
    aliases: ["add"],
    description: "Add user to group",
    usage: "[uid/profileUrl]",
    cooldown: 3,
    permissions: [1],
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
    const input = args[0]?.toLowerCase();

    if (!input) return reply("You have not entered the ID or profile link of the person to add to the group.");

    const { adminIDs } = data.thread.info;
    if (!adminIDs.includes(global.botID)) {
        return reply("The bot needs group administration rights to perform this command.");
    }

    let uid = !isNaN(input)
        ? input
        : extractUserIDFromURL(input);

    if (!uid) return reply("ID or profile link is invalid.");

    if (isNaN(uid)) {
        uid = (await api.getUserID(uid))[0]?.userID;
    }

    if (!uid || isNaN(uid)) return reply("ID or profile link is invalid.");

    if (uid === global.botID) return reply("The bot cannot add itself to the group.");
    if (uid === senderID) return reply("You cannot use this command to add yourself to the group.");

    try {
        await adduser(uid, threadID);
        return reply("Added successfully.");
    } catch (e) {
        console.error(e);
        return reply("An error has occurred, please try again later.");
    }
};

const extractUserIDFromURL = (url) => {
    const match = url.match(/(?:https?:\/\/)?(?:www.|m.)?(?:facebook|fb).com\/(?:\w)*#!\/?(?:pages\/)?(?:[?\w\-]*\/)?(?:profile.php\?id=(?=\d.*))?([\w\.-]+)/);
    return match ? match[1] : null;
};

export default {
    config,
    onCall,
};