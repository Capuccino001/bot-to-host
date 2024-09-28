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

const onCall = async ({ message, args, getLang }) => {
    const { songTitle, artist } = getSongTitleAndArtist(args);

    if (!songTitle) {
        return message.send(header + getLang("message") + footer);
    }

    try {
        await ensureCacheFolderExists();
        await message.react("⌛");

        const trackURLs = await fetchTrackURLs(songTitle);
        const downloadLink = await fetchDownloadLink(trackURLs[0]);

        // Download the track and send as a reply
        const filePath = await downloadTrack(downloadLink);
        await message.reply({
            body: `🎧 Playing: ${songTitle}${artist ? ` by ${artist}` : ''}`,
            attachment: fs.createReadStream(filePath)
        });

        // Delete the downloaded file after sending
        fs.unlink(filePath, err => {
            if (err) console.error("Error deleting file:", err);
            else console.log("File deleted successfully.");
        });

        console.log("Audio sent successfully.");
    } catch (error) {
        console.error("Error occurred:", error);
        await message.send(header + `An error occurred: ${error.message}` + footer);
    }
};

const getSongTitleAndArtist = (args) => {
    const byIndex = args.indexOf("by");
    const songTitle = byIndex !== -1 && byIndex > 0 && byIndex < args.length - 1
        ? args.slice(0, byIndex).join(" ")
        : args.join(" ");
    const artist = byIndex !== -1 ? args.slice(byIndex + 1).join(" ") : undefined;

    return { songTitle, artist };
};

const fetchTrackURLs = async (songTitle) => {
    const services = [
        { url: 'https://spotify-play-iota.vercel.app/spotify', params: { query: songTitle } },
        { url: 'http://zcdsphapilist.replit.app/spotify', params: { q: songTitle } },
        { url: 'https://samirxpikachuio.onrender.com/spotifysearch', params: { q: songTitle } },
        { url: 'https://openapi-idk8.onrender.com/search-song', params: { song: songTitle } },
        { url: 'https://markdevs-last-api.onrender.com/search/spotify', params: { q: songTitle } }
    ];

    for (const { url, params } of services) {
        try {
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

    throw new Error("No track URLs found from any API.");
};

const fetchDownloadLink = async (trackID) => {
    const response = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackID)}`);
    return response.data.download_link;
};

const downloadTrack = async (url) => {
    const response = await axios.get(url, { responseType: 'stream' });
    const filePath = `${cacheFolder}/${randomString()}.mp3`;

    return new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        response.data.pipe(writeStream);
        writeStream.on('finish', () => resolve(filePath));
        writeStream.on('error', reject);
    });
};

const randomString = (length = 10) => Math.random().toString(36).substring(2, 2 + length);

export default {
    config,
    onCall,
};