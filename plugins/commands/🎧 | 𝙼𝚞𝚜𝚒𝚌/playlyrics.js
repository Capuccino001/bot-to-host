import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
    name: "playlyrics",
    aliases: ["pl"],
    description: "Fetch lyrics and audio for a song",
    usage: "[song-name] [by <artist>]",
    cooldown: 10,
    permissions: [0, 1],
    credits: "coffee",
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = `${__dirname}/cache`;

const apiConfig = {
    lyricsApi: {
        name: "Lyrics API",
        url: (songName) => `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`,
    },
    audioApis: [
        { url: 'https://spotify-play-iota.vercel.app/spotify', params: { query: '' } },
        { url: 'https://www.samirxpikachu.run.place/spotifysearch', params: { q: '' } }
    ]
};

// Ensure the cache folder exists
const ensureCacheFolderExists = async () => {
    try {
        await fs.ensureDir(cacheFolder);
    } catch (error) {
        console.error('Error creating cache folder:', error);
    }
};

// Fetch lyrics
const fetchLyrics = async (songName) => {
    const apiUrl = apiConfig.lyricsApi.url(songName);

    try {
        const { data } = await axios.get(apiUrl);
        const { lyrics, title, artist } = data;

        if (!lyrics) throw new Error("Lyrics not found");

        return { title, artist, lyrics };
    } catch (error) {
        throw new Error(`Error fetching lyrics: ${error.message}`);
    }
};

// Fetch track URLs
const fetchTrackURLs = async (songTitle) => {
    for (const { url, params } of apiConfig.audioApis) {
        try {
            params.query = songTitle;
            const response = await axios.get(url, { params });
            if (response.data.trackURLs && response.data.trackURLs.length > 0) {
                return response.data.trackURLs;
            }
        } catch (error) {
            console.error(`Error with ${url} API:`, error.message);
        }
    }
    throw new Error("No track URLs found.");
};

// Fetch download link
const fetchDownloadLink = async (trackID) => {
    try {
        const response = await axios.get(`https://sp-dl-bice.vercel.app/spotify?id=${encodeURIComponent(trackID)}`);
        return response.data.download_link;
    } catch (error) {
        throw new Error(`Error fetching download link: ${error.message}`);
    }
};

// Download audio track
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
        throw new Error(`Error downloading track: ${error.message}`);
    }
};

// Parse song title and artist
const parseSongTitleAndArtist = (args) => {
    const byIndex = args.indexOf("by");
    const songTitle = byIndex !== -1 && byIndex > 0 && byIndex < args.length - 1
        ? args.slice(0, byIndex).join(" ")
        : args.join(" ");
    const artist = byIndex !== -1 ? args.slice(byIndex + 1).join(" ") : undefined;

    return { songTitle, artist };
};

// Main function
const onCall = async ({ message, args }) => {
    const { songTitle, artist } = parseSongTitleAndArtist(args);

    if (!songTitle) {
        return message.reply("Please provide a song name!");
    }

    try {
        await ensureCacheFolderExists();
        await message.react("🕰️");

        // Fetch lyrics and audio simultaneously
        const [lyricsResult, trackURLs] = await Promise.all([
            fetchLyrics(songTitle),
            fetchTrackURLs(songTitle)
        ]);

        if (!trackURLs.length) throw new Error("No track URLs found.");

        const downloadLink = await fetchDownloadLink(trackURLs[0]);
        const filePath = await downloadTrack(downloadLink);

        // Send lyrics first
        const { title, artist: lyricsArtist, lyrics } = lyricsResult;
        const formattedLyrics = `🎧 | Title: ${title}\n🎤 | Artist: ${lyricsArtist}\n・───── >ᴗ< ──────・\n${lyrics}\n・──────────────・`;
        await message.reply(formattedLyrics);

        // Then send the audio without a message body
        await message.send({
            attachment: fs.createReadStream(filePath)
        });

        fs.unlink(filePath, err => {
            if (err) console.error("Error deleting file:", err);
        });

        console.log("Lyrics and audio sent successfully.");
    } catch (error) {
        console.error("Error occurred:", error);
        await message.reply(`An error occurred: ${error.message}`);
    }
};

const randomString = (length = 10) => Math.random().toString(36).substring(2, 2 + length);

export default {
    config,
    onCall,
};
