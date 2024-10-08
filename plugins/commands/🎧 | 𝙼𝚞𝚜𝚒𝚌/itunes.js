import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
    name: "itunes",
    aliases: ["applemusic", "itunessearch"],
    version: "1.1",
    credits: "Vex_Kshitiz/coffee",
    description: "Search for a song on iTunes and send the audio",
    usages: "<song-name>",
    permission: [1, 2],
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
    const songTitle = args.join(" ");

    if (!songTitle) {
        return message.reply("Please provide a song name.");
    }

    try {
        await ensureCacheFolderExists();
        await message.react("⌛");

        // Fetch song details from the iTunes API
        const apiUrl = `https://api.popcat.xyz/itunes?q=${encodeURIComponent(songTitle)}`;
        const response = await axios.get(apiUrl);

        if (!response.data.name) {
            return message.reply("No song found on iTunes.");
        }

        const {
            name, artist, album, release_date, price, length, genre, thumbnail, url
        } = response.data;

        // Fetch the song using axios stream
        const downloadLink = await fetchSongFromUrl(url); // Assuming URL can be used to download

        if (!downloadLink) {
            return message.reply("Unable to fetch the song audio.");
        }

        // Download the track and send as a reply
        const filePath = await downloadTrack(downloadLink);

        const songInfo = `
🎵 **Song**: ${name}
🎤 **Artist**: ${artist}
💿 **Album**: ${album}
📅 **Release Date**: ${release_date}
💵 **Price**: ${price}
⏱ **Length**: ${formatLength(length)}
🎶 **Genre**: ${genre}
🔗 [Listen on iTunes](${url})
        `;

        await message.reply({
            body: songInfo,
            attachment: [
                { url: thumbnail },
                { attachment: fs.createReadStream(filePath) } // Send the actual song as an attachment
            ]
        });

        // Delete the downloaded file after sending
        fs.unlink(filePath, err => {
            if (err) console.error("Error deleting file:", err);
            else console.log("File deleted successfully.");
        });

    } catch (error) {
        console.error("Error occurred while fetching song:", error);
        await message.reply(`An error occurred: ${error.message}`);
    }
};

// Function to simulate fetching a downloadable link (or reuse the URL if it's already downloadable)
const fetchSongFromUrl = async (url) => {
    // In this case, we assume the URL is a direct download link
    return url;
};

// Download the track using axios stream
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

const formatLength = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
};

const randomString = (length = 10) => Math.random().toString(36).substring(2, 2 + length);

export default {
    config,
    onCall,
};