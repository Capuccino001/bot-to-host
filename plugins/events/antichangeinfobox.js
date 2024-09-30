export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    let alertMsg = null;

    if (Object.keys(getThreadInfo).length === 0) return;

    const antiChangeActions = {
        async antiChangeGroupName() {
            const defaultName = {
                "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
                "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
                "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
                "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
                "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨"
            }[threadID] || getThreadInfo.name || null;

            await Threads.updateInfo(threadID, { name: defaultName });
        },

        async antiChangeThreadColor() {
            const defaultColor = "195296273246380"; // Default thread color
            await Threads.updateInfo(threadID, { color: defaultColor });
        },

        async antiChangeThreadEmoji() {
            const defaultEmoji = "🧋"; // Default thread emoji
            await Threads.updateInfo(threadID, { emoji: defaultEmoji });
        },

        async antiChangeGroupImage() {
            const defaultImage = "https://scontent-sin6-4.xx.fbcdn.net/v/t1.15752-9/453385238_898368142210556_3530930341630206152_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=kJHxf2FdGusQ7kNvgGHnlBz&_nc_ht=scontent-sin6-4.xx&oh=03_Q7cD1QEaETOd-ELmW2_OcezHWUqU2EtUaZ1W7V6Lgxwg9YZAhA&oe=66D7117C"; // Default group image
            await Threads.updateInfo(threadID, { imageSrc: defaultImage });
        },
    };

    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const newName = logMessageData.name;
                await antiChangeActions.antiChangeGroupName(); // Always revert to default name
                alertMsg = `Thread name changed to "${newName}", reverted to default.`;
            }
            break;

        case "log:thread-color":
            {
                const newColor = logMessageData.thread_color || logMessageData.theme_color;
                await antiChangeActions.antiChangeThreadColor(); // Always revert to default color
                alertMsg = `Thread color changed to "${newColor}", reverted to default.`;
            }
            break;

        case "log:thread-icon":
            {
                const newEmoji = logMessageData.thread_icon || logMessageData.theme_emoji;
                await antiChangeActions.antiChangeThreadEmoji(); // Always revert to default emoji
                alertMsg = `Thread emoji changed to "${newEmoji}", reverted to default.`;
            }
            break;

        case "log:thread-image":
            {
                const newImage = logMessageData.imageSrc;
                await antiChangeActions.antiChangeGroupImage(); // Always revert to default image
                alertMsg = `Thread image changed, reverted to default.`;
            }
            break;

        default:
            break;
    }

    // Notify users about the revert action
    if (alertMsg) {
        for (const rUID of getThreadData.notifyChange?.registered || []) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}