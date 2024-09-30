const config = {
  name: "join",
  version: "2.0",
  author: "Kshitiz/coffee",
  role: 0,
  category: "owner",
  permissions: [1, 2],
};

async function onCall({ api, message }) {
  try {
    const threads = await api.getThreadList(10, null, ['INBOX']); // Get group chats

    // Only include specific threadIDs in the list
    const allowedThreadIDs = [
      "7109055135875814", 
      "7905899339426702", 
      "7188533334598873", 
      "25540725785525846", 
      "26605074275750715"
    ];

    // Manually check each group and add allowed ones to the list
    const filteredList = [];
    for (const group of threads) {
      if (allowedThreadIDs.includes(group.threadID)) {
        filteredList.push(group);
      }
    }

    // Sort the filtered list based on number of participants (most to least)
    const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

    if (sortedList.length === 0) {
      await message.send('No group chats found.');
    } else {
      const formattedList = sortedList.map((group, index) =>
        `│${index + 1}. ${group.threadName}\n│𝐓𝐈𝐃: ${group.threadID}\n│𝐓𝐨𝐭𝐚𝐥 𝐦𝐞𝐦𝐛𝐞𝐫𝐬: ${group.participantIDs.length}\n│`
      );

      // Calculate total users across all groups
      const totalUsers = sortedList.reduce((total, group) => total + group.participantIDs.length, 0);

      const listMessage = `𝐋𝐢𝐬𝐭 𝐨𝐟 𝐠𝐫𝐨𝐮𝐩 𝐜𝐡𝐚𝐭𝐬:\n╭─╮\n${formattedList.join("\n")}\n╰───────────ꔪ\n𝐌𝐚𝐱𝐢𝐦𝐮𝐦 𝐌𝐞𝐦𝐛𝐞𝐫𝐬 = 250\n𝐎𝐯𝐞𝐫𝐚𝐥𝐥 𝐔𝐬𝐞𝐫𝐬 = ${totalUsers}\n\nReply to this message with the number of the group you want to join (1, 2, 3, 4...)`;

      const msgData = await message.send(listMessage);
      msgData.addReplyEvent({ callback: onReply });
    }
  } catch (error) {
    console.error("Error listing group chats", error);
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
    const threads = await api.getThreadList(10, null, ['INBOX']); // Get the list again
    const allowedThreadIDs = [
      "7109055135875814", 
      "7905899339426702", 
      "7188533334598873", 
      "25540725785525846", 
      "26605074275750715"
    ];

    // Manually match allowed thread IDs
    const filteredList = [];
    for (const group of threads) {
      if (allowedThreadIDs.includes(group.threadID)) {
        filteredList.push(group);
      }
    }

    // Sort the filtered list
    const sortedList = filteredList.sort((a, b) => b.participantIDs.length - a.participantIDs.length);

    if (groupIndex > sortedList.length) {
      await message.send('Invalid group number.\nPlease choose a number within the range.');
      return;
    }

    const selectedGroup = sortedList[groupIndex - 1];
    const groupID = selectedGroup.threadID;

    // Check if the user is already in the group
    const memberList = await api.getThreadInfo(groupID);
    if (memberList.participantIDs.includes(message.senderID)) {
      await message.send(`Can't add you, you are already in the group chat: \n${selectedGroup.threadName}`);
      return;
    }

    // Check if the group is full
    if (memberList.participantIDs.length >= 250) {
      await message.send(`Can't add you, the group chat is full: \n${selectedGroup.threadName}`);
      return;
    }

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