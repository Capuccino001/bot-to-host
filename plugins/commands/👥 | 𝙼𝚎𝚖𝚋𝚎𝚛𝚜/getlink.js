import axios from "axios";

const config = {
    name: "getlink",
    description: "put your images, gif, and stickers inside a link.",
    usage: "[reply]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "XaviaTeam"
};

const supportedType = ["photo", "animated_image"];

async function upload(url) {
    try {
        const response = await axios.post(
            `${global.xva_api.main}/imgbb`,
            {
                url: url,
                apikey: process.env.IMGBB_KEY
            }
        );
        return response.data.url;
    } catch (error) {
        console.error("Upload error:", error);
        return null;
    }
}

async function onCall({ message }) {
    if (!process.env.IMGBB_KEY) {
        return message.reply("Please set IMGBB_KEY in the environment variables");
    }

    try {
        const { type, messageReply } = message;

        if (type !== "message_reply") {
            return message.reply("Please reply to a message");
        }

        const { attachments } = messageReply;

        if (!attachments || !attachments.length) {
            return message.reply("No attachment");
        }

        const filteredAttachments = attachments.filter(attachment => supportedType.includes(attachment.type));

        if (!filteredAttachments.length) {
            return message.reply("No supported attachment, only support photo and animated image");
        }

        const urls = await Promise.all(filteredAttachments.map(async (attachment) => {
            const url = await upload(attachment.url);
            return url ? url : null;
        }));

        const validUrls = urls.filter(url => url); // Filter out null values

        if (!validUrls.length) {
            return message.reply("Upload failed");
        }

        const text = validUrls.join("\n");
        return message.reply(text);
    } catch (err) {
        console.error("Error in onCall:", err);
        return message.reply("An error occurred");
    }
}

export default {
    config,
    onCall
};
