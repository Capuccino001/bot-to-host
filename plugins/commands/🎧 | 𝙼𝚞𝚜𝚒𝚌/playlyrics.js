import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import ytdl from '@distube/ytdl-core';
import yts from 'yt-search';

const config = {
  name: 'playlyrics',
  aliases: ['pl'],
  version: '1.0',
  credits: 'Your Name',
  description: 'Play a song and display its lyrics',
  usages: '<song name>',
  category: 'Music',
  cooldown: 10,
  permissions: [1, 2],
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

// API URL for lyrics
const lyricsApiUrl = 'https://lyrist.vercel.app/api/';

// Function to get lyrics from API
const getLyrics = async (artist, songName) => {
  try {
    const apiUrl = `${lyricsApiUrl}${encodeURIComponent(artist + " - " + songName)}`;
    const { data } = await axios.get(apiUrl);
    return data.lyrics;
  } catch (error) {
    console.error('Error getting lyrics:', error);
    return null;
  }
};

// Function to search for a song on YouTube
const searchSong = async (song) => {
  try {
    const { videos } = await yts(song);
    if (!videos.length) {
      return null;
    }
    return videos[0];
  } catch (error) {
    console.error('Error searching for song:', error);
    return null;
  }
};

// Function to download a song from YouTube
const downloadSong = async (url, fileName) => {
  try {
    const stream = ytdl(url, { quality: 'lowestaudio' });
    const filePath = `${cacheFolder}/${fileName}`;
    stream.pipe(fs.createWriteStream(filePath));

    stream.on('response', () => {
      console.info('[DOWNLOADER]', 'Starting download now!');
    });

    stream.on('info', (info) => {
      console.info('[DOWNLOADER]', `Downloading ${info.videoDetails.title} by ${info.videoDetails.author.name}`);
    });

    stream.on('end', () => {
      console.info('[DOWNLOADER] Downloaded');
    });

    return filePath;
  } catch (error) {
    console.error('Error downloading song:', error);
    return null;
  }
};

// Main function
const onCall = async ({ message, args }) => {
  try {
    const query = args.join(' ');

    if (!query) {
      const errorMessage = 'Please provide a song name';
      return message.reply(errorMessage);
    }

    await ensureCacheFolderExists();
    await message.react('🕰️');

    const song = await searchSong(query);
    if (!song) {
      const errorMessage = 'Song not found';
      return message.reply(errorMessage);
    }

    const { url, title, author } = song;
    const regex = /^(.+?)\s*-\s*(.+?)(?:\s*\(|\[|$)/;
    const match = title.match(regex);
    if (!match) {
      const errorMessage = 'Could not parse video title';
      return message.reply(errorMessage);
    }
    const [artist, songName] = match.slice(1, 3);

    const lyrics = await getLyrics(artist, songName);
    if (!lyrics) {
      const errorMessage = 'Lyrics not found';
      return message.reply(errorMessage);
    }

    const fileName = `music.mp3`;
    const filePath = await downloadSong(url, fileName);
    if (!filePath) {
      const errorMessage = 'Error downloading song';
      return message.reply(errorMessage);
    }

    const attachment = fs.createReadStream(filePath);

    const messageBody = `🎵 | Title: ${title}\n🎤 | Artist: ${author.name}\n\n${lyrics}`;
    const replyMessage = {
      body: messageBody,
      attachment: attachment
    };

    try {
      await message.reply(replyMessage);
    } catch (error) {
      console.error('Error replying to message:', error);
    }

    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  } catch (error) {
    console.error('Error occurred:', error);
    const errorMessage = `An error occurred: ${error.message}`;
    try {
      await message.reply(errorMessage);
    } catch (error) {
    console.error('Error replying to error message:', error);
    }
  }
};

export default {
  config,
  onCall,
};
