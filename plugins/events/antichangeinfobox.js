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

export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    let alertMsg = null,
        reversed = false;

    if (Object.keys(getThreadInfo).length === 0) return;

    const antiChangeActions = {
        // Handle anti-change for group name
        async antiChangeGroupName(oldName, newName) {
            const isBot = author == botID;
            const isReversing = global.data.temps.some(
                (i) =>
                    i.type == "antiChangeGroupName" &&
                    i.threadID == threadID
            );
            if (!isBot && !isReversing) {
                global.data.temps.push({
                    type: "antiChangeGroupName",
                    threadID: threadID,
                });
                await new Promise((resolve) => {
                    api.setTitle(oldName, threadID, (err) => {
                        if (!err) reversed = true;
                        global.data.temps.splice(
                            global.data.temps.indexOf({
                                type: "antiChangeGroupName",
                                threadID: threadID,
                            }),
                            1
                        );
                        resolve();
                    });
                });
            }
        },

        // Handle anti-change for thread color
        async antiChangeThreadColor(newColor) {
            await Threads.updateInfo(threadID, { color: newColor });
        },

        // Handle anti-change for thread emoji
        async antiChangeThreadEmoji(newEmoji) {
            await Threads.updateInfo(threadID, { emoji: newEmoji });
        },

        // Handle anti-change for group image
        async antiChangeGroupImage(oldImage) {
            await new Promise((resolve) => {
                api.changeGroupImage(oldImage, threadID, (err) => {
                    if (!err) reversed = true;
                    resolve();
                });
            });
        },
    };

    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const oldName = getThreadInfo.name || null;
                const newName = logMessageData.name;

                if (getThreadData.antiSettings?.antiChangeGroupName === true) {
                    await antiChangeActions.antiChangeGroupName(oldName, newName);
                } else {
                    await Threads.updateInfo(threadID, { name: newName });
                }

                if (reversed && getThreadData.antiSettings?.notifyChange === true) {
                    api.sendMessage(
                        getLang("plugins.events.thread-update.name.reversed_t"),
                        threadID
                    );
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName =
                        (await Users.getInfo(author))?.name || author;
                    alertMsg = getLang(
                        "plugins.events.thread-update.name.changed",
                        {
                            authorName: authorName,
                            newName: newName,
                        }
                    );
                    if (reversed) {
                        alertMsg += getLang(
                            "plugins.events.thread-update.name.reversed"
                        );
                    }
                }
            }
            break;

        case "log:thread-color":
            {
                const newColor =
                    logMessageData.thread_color || logMessageData.theme_color;

                if (getThreadData?.notifyChange?.status === true) {
                    await antiChangeActions.antiChangeThreadColor(newColor);
                }
            }
            break;

        case "log:thread-icon":
            {
                const newEmoji =
                    logMessageData.thread_icon || logMessageData.theme_emoji;

                if (getThreadData?.notifyChange?.status === true) {
                    await antiChangeActions.antiChangeThreadEmoji(newEmoji);
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
                    await Threads.updateInfo(threadID, { imageSrc: newImage });
                }

                if (getThreadData?.notifyChange?.status === true) {
                    const authorName =
                        (await Users.getInfo(author))?.name || author;
                    alertMsg = getLang(
                        "plugins.events.thread-update.image.changed",
                        {
                            authorName: authorName,
                            newImage: newImage,
                        }
                    );
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