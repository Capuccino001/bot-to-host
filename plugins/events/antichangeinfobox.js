export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    let alertMsg = null;
    let reversed = false;

    if (Object.keys(getThreadInfo).length === 0) return;

    const antiChangeActions = {
        async antiChangeGroupName() {
            const oldName = getThreadInfo.name || null;
            const defaultName = {
                "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
                "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
                "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
                "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
                "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨"
            }[threadID] || oldName;

            await Threads.updateInfo(threadID, { name: defaultName });
            reversed = true;
        },

        async antiChangeThreadColor() {
            const defaultColor = "195296273246380"; // Default thread color
            await Threads.updateInfo(threadID, { color: defaultColor });
            reversed = true;
        },

        async antiChangeThreadEmoji() {
            const defaultEmoji = "🧋"; // Default thread emoji
            await Threads.updateInfo(threadID, { emoji: defaultEmoji });
            reversed = true;
        },

        async antiChangeGroupImage() {
            const defaultImage = "https://scontent-sin6-4.xx.fbcdn.net/v/t1.15752-9/453385238_898368142210556_3530930341630206152_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=kJHxf2FdGusQ7kNvgGHnlBz&_nc_ht=scontent-sin6-4.xx&oh=03_Q7cD1QEaETOd-ELmW2_OcezHWUqU2EtUaZ1W7V6Lgxwg9YZAhA&oe=66D7117C"; // Default group image
            await Threads.updateInfo(threadID, { imageSrc: defaultImage });
            reversed = true;
        },
    };

    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const newName = logMessageData.name;
                if (getThreadData.antiSettings?.antiChangeGroupName) {
                    await antiChangeActions.antiChangeGroupName();
                } else {
                    await Threads.updateInfo(threadID, { name: newName });
                }

                if (reversed && getThreadData.antiSettings?.notifyChange) {
                    api.sendMessage(
                        "The thread name has been reverted to default.",
                        threadID
                    );
                }
            }
            break;

        case "log:thread-color":
            {
                if (getThreadData.antiSettings?.antiChangeThreadColor) {
                    await antiChangeActions.antiChangeThreadColor();
                }
            }
            break;

        case "log:thread-icon":
            {
                if (getThreadData.antiSettings?.antiChangeThreadEmoji) {
                    await antiChangeActions.antiChangeThreadEmoji();
                }
            }
            break;

        case "log:thread-image":
            {
                if (getThreadData.antiSettings?.antiChangeGroupImage) {
                    await antiChangeActions.antiChangeGroupImage();
                }
            }
            break;

        default:
            break;
    }

    if (alertMsg) {
        for (const rUID of getThreadData.notifyChange.registered) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}