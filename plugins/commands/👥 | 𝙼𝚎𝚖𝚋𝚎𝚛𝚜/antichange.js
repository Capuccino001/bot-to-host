const config = {
    name: "antichangeinfobox",
    aliases: ["antichangeinfobox"],
    description: "Monitors thread property changes and reverts unauthorized changes like name, color, emoji, and image.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

const DEFAULTS = {
    avatar: "https://scontent-sin6-4.xx.fbcdn.net/v/t1.15752-9/453385238_898368142210556_3530930341630206152_n.jpg?_nc_cat=100&ccb=1-7&_nc_sid=9f807c&_nc_ohc=kJHxf2FdGusQ7kNvgGHnlBz&_nc_ht=scontent-sin6-4.xx&oh=03_Q7cD1QEaETOd-ELmW2_OcezHWUqU2EtUaZ1W7V6Lgxwg9YZAhA&oe=66D7117C",
    emoji: "🧋",
    color: "195296273246380",
    threadNames: {
        "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
        "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
        "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
        "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
        "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨"
    }
};

async function onCall({ api, event, threadsData, usersData }) {
    const { threadID, author, logMessageData, logMessageType } = event;
    const getThread = await threadsData.get(threadID) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    let alertMsg = null, reversed = false;

    if (Object.keys(getThreadInfo).length === 0) return;

    const antiChangeActions = {
        // Handle anti-change for group name
        async antiChangeGroupName(oldName, newName) {
            const isBot = author == api.getCurrentUserID();
            const isReversing = global.data.temps.some(
                (i) => i.type == "antiChangeGroupName" && i.threadID == threadID
            );
            if (!isBot && !isReversing) {
                global.data.temps.push({ type: "antiChangeGroupName", threadID });
                await new Promise((resolve) => {
                    api.setTitle(oldName, threadID, (err) => {
                        if (!err) reversed = true;
                        global.data.temps = global.data.temps.filter(
                            (i) => !(i.type == "antiChangeGroupName" && i.threadID == threadID)
                        );
                        resolve();
                    });
                });
            }
        },

        // Handle anti-change for thread color
        async antiChangeThreadColor(newColor) {
            await threadsData.updateInfo(threadID, { color: DEFAULTS.color });
        },

        // Handle anti-change for thread emoji
        async antiChangeThreadEmoji(newEmoji) {
            await threadsData.updateInfo(threadID, { emoji: DEFAULTS.emoji });
        },

        // Handle anti-change for group image
        async antiChangeGroupImage(oldImage) {
            await new Promise((resolve) => {
                api.changeGroupImage(DEFAULTS.avatar, threadID, (err) => {
                    if (!err) reversed = true;
                    resolve();
                });
            });
        },
    };

    switch (logMessageType) {
        case "log:thread-name":
            {
                const oldName = getThreadInfo.name || null;
                const newName = logMessageData.name;
                const defaultThreadName = DEFAULTS.threadNames[threadID];

                if (getThreadData.antiSettings?.antiChangeGroupName === true) {
                    await antiChangeActions.antiChangeGroupName(oldName, defaultThreadName || oldName);
                } else {
                    await threadsData.updateInfo(threadID, { name: defaultThreadName || newName });
                }

                if (reversed && getThreadData.antiSettings?.notifyChange === true) {
                    api.sendMessage("Group name reverted to the default.", threadID);
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName = (await usersData.getInfo(author))?.name || author;
                    alertMsg = `Group name changed by ${authorName} to ${newName}.`;
                    if (reversed) alertMsg += " The change was reverted.";
                }
            }
            break;

        case "log:thread-color":
            {
                const newColor = logMessageData.thread_color || logMessageData.theme_color;

                if (getThreadData.antiSettings?.antiChangeThreadColor === true) {
                    await antiChangeActions.antiChangeThreadColor(newColor);
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName = (await usersData.getInfo(author))?.name || author;
                    alertMsg = `Thread color changed by ${authorName}.`;
                }
            }
            break;

        case "log:thread-icon":
            {
                const newEmoji = logMessageData.thread_icon || logMessageData.theme_emoji;

                if (getThreadData.antiSettings?.antiChangeThreadEmoji === true) {
                    await antiChangeActions.antiChangeThreadEmoji(newEmoji);
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName = (await usersData.getInfo(author))?.name || author;
                    alertMsg = `Thread emoji changed by ${authorName}.`;
                }
            }
            break;

        case "log:thread-image":
            {
                const oldImage = getThreadInfo.imageSrc;
                const newImage = logMessageData.imageSrc;

                if (getThreadData.antiSettings?.antiChangeGroupImage === true) {
                    await antiChangeActions.antiChangeGroupImage(oldImage);
                } else {
                    await threadsData.updateInfo(threadID, { imageSrc: DEFAULTS.avatar });
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName = (await usersData.getInfo(author))?.name || author;
                    alertMsg = `Group image changed by ${authorName}.`;
                }
            }
            break;

        default:
            break;
    }

    if (alertMsg) {
        for (const rUID of getThreadData.notifyChange?.registered || []) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}

export default {
    config,
    onCall,
};