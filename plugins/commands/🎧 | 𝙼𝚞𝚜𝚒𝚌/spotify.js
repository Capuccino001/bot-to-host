import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
  name: "spotify",
  aliases: ["play"],
  version: "1.7",
  credits: "Vex_Kshitiz/coffee",
  description: "Play a song from Spotify",
  usages: "<song-name> [by <artist>]",
  category: "Music",
  cooldown: 10
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = `${__dirname}/cache`;

// Ensure the cache folder exists
const ensureCacheFolderExists = async () => {
  try {
    await fs.ensureDir(cacheFolder);
  } catch (error) {
    console.error('Error creating cache folder:', error);
  }
};

// API Calls
const trackURLServices = [
  { url: 'https://spotify-play-iota.vercel.app/spotify', params: { query: '' } },
  { url: 'https://www.samirxpikachu.run.place/spotifysearch', params: { q: '' } }
];

const fetchTrackURLs = async (songTitle) => {
  for (const { url, params } of trackURLServices) {
    try {
      params.query = songTitle;
      const response = await axios.get(url, { params });
      if (response.data.trackURLs && response.data.trackURLs.length > 0) {
        console.log(`Track URLs fetched from ${url}`);
        return response.data.trackURLs;
      }
      console.log(`No track URLs found at ${url}`);
    } catch (error) {
      console.error(`Error with ${url} API:`, error.message);
    }
  }

  return [];
};

const fetchDownloadLink = async (trackID) => {
  try {
    const response = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackID)}`);
    return response.data.download_link;
  } catch (error) {
    console.error("Error fetching download link:", error.message);
    throw error;
  }
};

const downloadTrack = async (url) => {
  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = `${cacheFolder}/${randomString()}.mp3`;

    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath);
      response.data.pipe(writeStream);
      writeStream.on('finish', () => resolve(filePath));
      writeStream.on('error', reject);
    });
  } catch (error) {
    console.error("Error downloading track:", error.message);
    throw error;
  }
};

// Song parsing
const parseSongTitleAndArtist = (args) => {
  const byIndex = args.indexOf("by");
  const songTitle = byIndex !== -1 && byIndex > 0 && byIndex < args.length - 1
    ? args.slice(0, byIndex).join(" ")
    : args.join(" ");
  const artist = byIndex !== -1 ? args.slice(byIndex + 1).join(" ") : undefined;

  return { songTitle, artist };
};

// Main function
const onCall = async ({ message, args, getLang }) => {
  const { songTitle, artist } = parseSongTitleAndArtist(args);

  if (!songTitle) {
    return message.reply(`${header}${getLang("message")}${footer}`);
  }

  try {
    await ensureCacheFolderExists();
    await message.react("⌛");

    const trackURLs = await fetchTrackURLs(songTitle);
    if (!trackURLs.length) {
      throw new Error("No track URLs found from any API.");
    }

    const downloadLink = await fetchDownloadLink(trackURLs[0]);
    const filePath = await downloadTrack(downloadLink);

    await message.reply({
      body: `🎧 Playing: ${songTitle}${artist ? ` by ${artist}` : ''}`,
      attachment: fs.createReadStream(filePath)
    });

    fs.unlink(filePath, err => {
      if (err) console.error("Error deleting file:", err);
      else console.log("File deleted successfully.");
    });

    console.log("Audio sent successfully.");
  } catch (error) {
    console.error("Error occurred:", error);
    await message.reply(`${header}An error occurred: ${error.message}${footer}`);
  }
};

const randomString = (length = 10) => Math.random().toString(36).substring(2, 2 + length);

export default {
  config,
  onCall,
};
