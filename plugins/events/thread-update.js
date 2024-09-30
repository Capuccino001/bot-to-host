export default async function ({ event }) {
    const { api } = global;
    const { threadID, author, logMessageData } = event;
    const { Threads, Users } = global.controllers;
    const getThread = (await Threads.get(threadID)) || {};
    const getThreadData = getThread.data || {};
    const getThreadInfo = getThread.info || {};

    const defaultName = {
        "7109055135875814": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟1🧋✨",
        "7905899339426702": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟2🧋✨",
        "7188533334598873": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟3🧋✨",
        "25540725785525846": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟4🧋✨",
        "26605074275750715": "𝙵𝚛𝚎𝚎 𝚂𝚎𝚊𝚛𝚌𝚑 𝚟5🧋✨",
    };

    let alertMsg = null,
        reversed = true;

    if (Object.keys(getThreadInfo).length === 0) return;
    switch (event.logMessageType) {
        case "log:thread-name":
            {
                const oldName = getThreadInfo.name || null;
                const newName = logMessageData.name;
                let smallCheck = false;

                // Check if thread ID matches any default name
                if (defaultName.hasOwnProperty(threadID)) {
                    const defaultThreadName = defaultName[threadID];
                    if (newName !== defaultThreadName) {
                        const isBot = author == botID;
                        const isReversing = global.data.temps.some(
                            (i) =>
                                i.type == "antiChangeGroupName" &&
                                i.threadID == threadID
                        );
                        if (!(isBot && isReversing)) {
                            global.data.temps.push({
                                type: "antiChangeGroupName",
                                threadID: threadID,
                            });
                            await new Promise((resolve) => {
                                api.setTitle(defaultThreadName, threadID, (err) => {
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
                        } else if (isBot) {
                            smallCheck = true;
                        }
                    }
                } else if (getThreadData.antiSettings?.antiChangeGroupName == true) {
                    const isBot = author == botID;
                    const isReversing = global.data.temps.some(
                        (i) =>
                            i.type == "antiChangeGroupName" &&
                            i.threadID == threadID
                    );
                    if (!(isBot && isReversing)) {
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
                    } else if (isBot) {
                        smallCheck = true;
                    }
                } else {
                    await Threads.updateInfo(threadID, { name: newName });
                }

                if (
                    !smallCheck &&
                    reversed &&
                    getThreadData?.antiSettings?.notifyChange === true
                )
                    api.sendMessage(
                        getLang("plugins.events.thread-update.name.reversed_t"),
                        threadID
                    );

                if (
                    !smallCheck &&
                    getThreadData?.notifyChange?.status === true
                ) {
                    const authorName =
                        (await Users.getInfo(author))?.name || author;
                    alertMsg = getLang(
                        "plugins.events.thread-update.name.changed",
                        {
                            authorName: authorName,
                            authorId: author,
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
        // Other cases remain unchanged...
    }

    if (alertMsg) {
        for (const rUID of getThreadData.notifyChange.registered) {
            await global.utils.sleep(300);
            api.sendMessage(alertMsg, rUID);
        }
    }

    return;
}