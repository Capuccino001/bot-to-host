import { writeFileSync, existsSync, mkdirSync, createReadStream } from 'fs';
import { join } from 'path';
import axios from 'axios';
import { fileURLToPath } from 'url';

const __dirname = join(fileURLToPath(import.meta.url), '..'); // Resolves __dirname for ES modules

export default {
  config: {
    name: "remini",
    aliases: [],
    version: "2.0",
    author: "Vex_Kshitiz",
    countDown: 20,
    role: 0,
    shortDescription: "remini",
    longDescription: "enhance the image quality",
    category: "tool",
    guide: {
      en: "{p}remini (reply to image)",
    }
  },

  onStart: async function ({ message, event, api }) {
    api.setMessageReaction("🕰️", event.messageID, (err) => {}, true);
    const { type: messageType, messageReply } = event;
    const { attachments, threadID, messageID } = messageReply || {};

    if (messageType === "message_reply" && attachments) {
      const [attachment] = attachments;
      const { url: imageUrl, type: attachmentType } = attachment || {};

      if (!attachment || !["photo", "sticker"].includes(attachmentType)) {
        return message.reply("❌ | Reply must be an image.");
      }

      try {
        const { data } = await axios.get(`https://vex-kshitiz.vercel.app/upscale?url=${encodeURIComponent(imageUrl)}`, {
          responseType: "json"
        });

        const enhancedImageUrl = data.result_url;
        const imageResponse = await axios.get(enhancedImageUrl, { responseType: "arraybuffer" });

        const cacheDir = join(__dirname, "cache");
        if (!existsSync(cacheDir)) {
          mkdirSync(cacheDir, { recursive: true });
        }

        const imagePath = join(cacheDir, "remi_image.png");
        writeFileSync(imagePath, imageResponse.data);

        message.reply({ attachment: createReadStream(imagePath) }, threadID);
      } catch (error) {
        console.error(error);
        message.reply("❌ | Error occurred while enhancing image.");
      }
    } else {
      message.reply("❌ | Please reply to an image.");
    }
  }
};