import axios from 'axios';

const config = {
    name: "lyrics",
    aliases: ["lyric"],
    description: "Fetch lyrics for a song",
    usage: "[song-name]",
    cooldown: 5,
    permissions: [0, 1],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

const apiConfig = {
    name: "Primary API",
    url: (songName) => `https://lyrist.vercel.app/api/${encodeURIComponent(songName)}`,
};

async function fetchLyrics(message, songName) {
    const apiUrl = apiConfig.url(songName);

    try {
        const { data } = await axios.get(apiUrl);
        const { lyrics, title, artist } = data;

        if (!lyrics) throw new Error("Lyrics not found");

        sendFormattedLyrics(message, title, artist, lyrics);
    } catch (error) {
        console.error(`Error fetching lyrics from ${apiConfig.name} for "${songName}":`, error.message);
        message.send(`Sorry, there was an error getting the lyrics for "${songName}": ${error.message}`);
    }
}

function sendFormattedLyrics(message, title, artist, lyrics) {
    const formattedLyrics = `🎧 | Title: ${title}\n🎤 | Artist: ${artist}\n━━━━━━━━━━━━━━━━\n${lyrics}\n━━━━━━━━━━━━━━━━`;
    message.send(formattedLyrics);
}

async function onCall({ message, args }) {
    const songName = args.join(" ").trim();
    if (!songName) return message.send("Please provide a song name!");

    await fetchLyrics(message, songName);
}

export default {
    config,
    onCall,
};