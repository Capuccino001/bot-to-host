const config = {
    name: "chat",
    aliases: ["chat"],
    description: "Chat with an AI model.",
    usage: "[query]",
    cooldown: 3,
    permissions: [1, 2],
    credits: "Coffee",
};

// Function to fetch data from API and handle response
const fetchApiData = async (query) => {
    const url = "https://aga-api.aichatting.net/aigc/chat/v2/stream";
    const headers = {
        "sec-ch-ua": '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "source": "web",
        "sec-ch-ua-mobile": "?1",
        "user-agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36",
        "vtoken": "DdaVa46fUAzYfKQInue0r5OrBhATE6hDC5H8a3W27QZxf2T7vxWX+lMV2v+CF8bE9F+9QKsO3XrbEtHhwfvPmcV4mGBpODSTFCs9dPrAoCI94lx5SZpUKMpsiUzMzUP397IsAm/aVm4bSyhZXsxdDSUvb0fjcrUBoQVgrT6ZuDg=",
        "content-type": "application/json",
        "accept": "text/event-stream,application/json, text/event-stream",
        "lang": "en",
        "sec-ch-ua-platform": '"Android"',
        "origin": "https://www.aichatting.net",
        "sec-fetch-site": "same-site",
        "sec-fetch-mode": "cors",
        "sec-fetch-dest": "empty",
        "referer": "https://www.aichatting.net/",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-PH,en-US;q=0.9,en;q=0.8,ru;q=0.7,tr;q=0.6,zh-CN;q=0.5,zh;q=0.4,fil;q=0.3",
        "priority": "u=1, i"
    };
    const data = {
        "spaceHandle": true,
        "roleId": 77,
        "messages": [
            {"role": "user", "content": query},
        ],
        "conversationId": 15865729,
        "model": "gpt-3.5-turbo"
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });

    if (!response.ok) throw new Error("⚠️ Failed to fetch data");

    const responseBody = await response.text();
    const lines = responseBody.split('\n');
    const result = lines.filter(line => line.startsWith('data:')).map(line => line.substring(5)).join('\n');
    return result;
};

// Reply event handler
async function reply({ eventData, message }) {
    if (eventData.type !== "message") return;

    const { body: userQuery } = message;

    try {
        await message.react("🕰️"); // Indicate processing
        const result = await fetchApiData(userQuery);
        await message.reply(result);
        await message.react("✔️"); // React with ✅ on success
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.");
    }
}

async function onCall({ message, args }) {
    const userQuery = args.join(" ").trim();
    if (!userQuery) return message.reply("Please provide a query.");

    try {
        await message.react("🕰️"); // Indicate processing
        const result = await fetchApiData(userQuery);
        const msg = await message.reply(result);
        await message.react("✔️"); // React with ✅ on success

        // Attach reply event handler for follow-up messages
        msg.addReplyEvent({ callback: reply, type: "message", uid: message.senderID });
    } catch (error) {
        console.error(error);
        await message.react("✖️"); // React with ❎ on error
        await message.reply("⚠️ An error occurred while fetching the data.");
    }
}

export default {
    config,
    onCall
};
