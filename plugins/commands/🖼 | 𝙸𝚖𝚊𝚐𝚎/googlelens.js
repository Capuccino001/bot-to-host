import fetch from 'node-fetch';
import axios from 'axios';
import { createReadStream, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = join(__filename, '..');

const config = {
  name: "googlelens",
  aliases: ["glens"],
  description: "Fetches information about an image using Google Lens.",
  usage: "[reply to an image message]",
  cooldown: 3,
  permissions: [1, 2],
  credits: "Coffee",
};

const boldFontMap = {
  ' ': ' ',
  'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡',
  'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪',
  'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
  'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇',
  'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐',
  'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
};

const toBoldFont = (text) => {
  return text.split('').map(char => boldFontMap[char] || char).join('');
};

const fetchGoogleLensData = async (imageUrl) => {
  try {
    const response = await fetch(`https://deku-rest-apis.ooguy.com/api/glens?url=${encodeURIComponent(imageUrl)}`);
    if (!response.ok) {
      throw new Error("⚠️ Failed to fetch data");
    }
    const { status, data } = await response.json();
    if (!status || !data.length) {
      throw new Error("⚠️ No results found.");
    }
    return data.slice(0, 6); // Limit results to 6
  } catch (error) {
    throw error;
  }
};

const downloadImageAsStream = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const path = `plugins/commands/cache/${Math.random().toString(36).substr(2, 9)}.jpg`;
    writeFileSync(path, response.data);
    return { path, stream: createReadStream(path) };
  } catch (error) {
    throw error;
  }
};

const onCall = async ({ message }) => {
  const { messageReply } = message; // Get the replied message
  const { attachments } = messageReply || {};

  if (!attachments || !attachments.length || !["photo", "sticker"].includes(attachments[0]?.type)) {
    await message.reply("⚠️ No image found in the replied message.");
    return;
  }

  const imageUrl = attachments[0].url; // Extract the image URL

  try {
    await message.react("🕰️"); // Indicate processing
    const results = await fetchGoogleLensData(imageUrl);

    const cacheFiles = [];
    const imgData = [];

    await Promise.all(results.map(async (result) => {
      const { path, stream } = await downloadImageAsStream(result.thumbnail);
      cacheFiles.push(path);
      imgData.push(stream);
    }));

    const replyMessages = results.map((item, index) => 
      `${index + 1}. ${toBoldFont("Title:")} ${item.title}\n${toBoldFont("Source:")} ${item.source}\n${toBoldFont("Link:")} ${item.link}`
    ).join("\n\n");

    await message.react("✔️"); // React with ✔️ on success
    message.send({
      attachment: imgData,
      body: replyMessages
    });
  } catch (error) {
    console.error(error);
    await message.react("✖️"); // React with ✖️ on error
    await message.reply("⚠️ An error occurred while fetching the data.");
  } finally {
    await Promise.all(cacheFiles.map(async (file) => {
      try {
        unlinkSync(file);
      } catch (error) {
        console.error(`[ERROR] Failed to delete cache file: ${file}\n`, error);
      }
    }));
  }
};

export default {
  config,
  onCall
};
