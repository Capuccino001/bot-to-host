const config = {
  name: "join",
  version: "2.0",
  author: "Kshitiz/coffee",
  role: 0,
  category: "owner",
  permissions: [1, 2],
};

async function handleCommand(event, xDatabase) {
  const { threadID, senderID } = event;
  const { Threads, Users } = xDatabase.controllers;

  // Fetch group and user data using the provided database controllers
  const _thread = event.isGroup === true ? await Threads.get(threadID) : null;
  const _user = await Users.get(senderID);

  // Use this data for further processing
  return { thread: _thread, user: _user };
}

async function onCall({ api, message, event, xDatabase }) {
  try {
    // Ensure the event has threadID and senderID
    if (!event || !event.threadID || !event.senderID) {
      throw new Error("Event does not have the required properties (threadID or senderID).");
    }

    // Fetch thread and user data
    const { thread } = await handleCommand(event, xDatabase);

    // Check if the current thread is a group chat and proceed
    if (thread) {
      // Pre-defined allowed thread data (hardcoded)
      const allowedGroups = [
        { threadID: "7109055135875814", threadName: "Group A", participantIDs: [] },
        { threadID: "7905899339426702", threadName: "Group B", participantIDs: [] },
        { threadID: "7188533334598873", threadName: "Group C", participantIDs: [] },
        { threadID: "25540725785525846", threadName: "Group D", participantIDs: [] },
        { threadID: "26605074275750715", threadName: "Group E", participantIDs: [] }
      ];

      // Sort the groups by participant count (empty in this example)
      const sortedGroups = allowedGroups.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

      if (sortedGroups.length === 0) {
        await message.send('No group chats found.');
      } else {
        const formattedList = sortedGroups.map((group, index) =>
          `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
        );

        const totalUsers = sortedGroups.reduce((total, group) => total + group.participantIDs.length, 0);

        const listMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)`;

        const msgData = await message.send(listMessage);
        msgData.addReplyEvent({ callback: onReply });
      }
    } else {
      await message.send('This command is only available in group chats.');
    }
  } catch (error) {
    console.error("Error listing group chats", error);
    await message.send('An error occurred while trying to list the group chats.');
  }
}

async function onReply({ api, message, args, Reply }) {
  const { author } = Reply;

  if (message.senderID !== author) {
    return;
  }

  const groupIndex = parseInt(args[0], 10);

  if (isNaN(groupIndex) || groupIndex <= 0) {
    await message.send('Invalid input.\nPlease provide a valid number.');
    return;
  }

  try {
    // Pre-defined allowed group data (hardcoded)
    const allowedGroups = [
      { threadID: "7109055135875814", threadName: "Group A", participantIDs: [] },
      { threadID: "7905899339426702", threadName: "Group B", participantIDs: [] },
      { threadID: "7188533334598873", threadName: "Group C", participantIDs: [] },
      { threadID: "25540725785525846", threadName: "Group D", participantIDs: [] },
      { threadID: "26605074275750715", threadName: "Group E", participantIDs: [] }
    ];

    // Sort the groups manually
    const sortedGroups = allowedGroups.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

    if (groupIndex > sortedGroups.length) {
      await message.send('Invalid group number.\nPlease choose a number within the range.');
      return;
    }

    const selectedGroup = sortedGroups[groupIndex - 1];
    const groupID = selectedGroup.threadID;

    // Simulate fetching participant IDs for the selected group (hardcoded as empty)
    const memberList = await api.getThreadInfo(groupID);  // May need replacement logic if unavailable
    if (memberList.participantIDs.includes(message.senderID)) {
      await message.send(`Can't add you, you are already in the group chat: \n${selectedGroup.threadName}`);
      return;
    }

    // Check if the group is full
    if (memberList.participantIDs.length >= 250) {
      await message.send(`Can't add you, the group chat is full: \n${selectedGroup.threadName}`);
      return;
    }

    // Add the user to the group (if the API supports this action)
    await api.addUserToGroup(message.senderID, groupID);
    await message.send(`You have joined the group chat: ${selectedGroup.threadName}`);
  } catch (error) {
    console.error("Error joining group chat", error);
    let errorMessage = 'Failed to add you to the group due to privacy settings.';

    if (error.response && error.response.error) {
      errorMessage += `\nError: ${error.response.error}`;
    }

    await message.send(errorMessage);
  }
}

export default {
  config,
  onCall,
};