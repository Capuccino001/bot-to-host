import ffmpegPath from "ffmpeg-static"
import fluent from "fluent-ffmpeg"
import ytdl from "@distube/ytdl-core"
import { join } from "path";
import { statSync } from "fs";

const _48MB = 48 * 1024 * 1024;

const config = {
    name: "audio",
    aliases: ['yt2mp3', 'sing'],
    version: "1.0.3",
    description: "Play music from youtube",
    usage: '<keyword/url>',
    cooldown: 30,
    credits: "XaviaTeam",
    extra: {
        "MAX_SONGS": 6
    }
}

function onLoad() {
    fluent.setFfmpegPath(ffmpegPath);
}

async function playMusic(message, song) {
    const { title, id } = song;
    message.react("⏳");
    const cachePath = join(global.cachePath, `_ytaudio${Date.now()}.mp3`);
    try {
        let stream = ytdl(id, { quality: 'lowestaudio' });
        await new Promise((resolve, reject) => {
            fluent(stream)
                .save(cachePath)
                .on('end', () => {
                    resolve();
                })
                .on('error', (err) => {
                    reject(err);
                })
        });

        const stat = statSync(cachePath);
        if (stat.size > _48MB) {
            message.reply("Audio is too large, max size is 48MB");
        } else await message.reply({
            body: `[ ${title} ]`,
            attachment: global.reader(cachePath)
        });
        message.react("✅");
    } catch (err) {
        message.react("❌");
        console.error(err);
        message.reply("An error occured");
    }

    try {
        if (global.isExists(cachePath)) global.deleteFile(cachePath);
    } catch (err) {
        console.error(err);
    }
}

async function chooseSong({ message, eventData }) {
    const { songs } = eventData;

    const index = parseInt(message.body) - 1;
    if (isNaN(index) || index < 0 || index >= songs.length) return message.reply("Invalid index");

    const song = songs[index];

    try {
        await playMusic(message, song);
    } catch (err) {
        throw err;
    }
}

function formatDuration(duration) {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const hours = (parseInt(match[1]) || 0);
    const minutes = (parseInt(match[2]) || 0);
    const seconds = (parseInt(match[3]) || 0);

    return `${hours ? hours + ":" : ""}${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
}

async function getVideoInfo(id) {
    try {
        const { data } = await global.GET(`${global.xva_api.main}/ytvideodetails?id=${id}`)
        return data.result[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function searchByKeyword(keyword, MAX_SONGS) {
    try {
        if (!keyword) return [];
        const { data } = await global.GET(`${global.xva_api.main}/ytsearch?keyword=${encodeURIComponent(keyword)}&maxResults=${MAX_SONGS}`);
        if (!data?.result) return [];
        return data.result;

    } catch (err) {
        throw err;
    }
}

async function downloadThumbnails(urls) {
    try {
        const attachments = [];
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (!url) continue;
            const path = join(global.cachePath, `_ytaudio${Date.now()}.jpg`);
            await global.downloadFile(path, url);

            attachments.push(path);
        }

        return attachments;
    } catch (err) {
        throw err;
    }
}

async function onCall({ message, args, extra }) {
    try {
        if (!args[0]) return message.reply("Please provide keyword or an url");
        let url = args[0];
        if (!url.match(/^(http(s)?:\/\/)?((w){3}.)?youtu(be|.be)?(\.com)?\/.+/)) {
            let data = await searchByKeyword(args.join(" "), extra.MAX_SONGS);
            if (!data[0]) return message.reply("No result found");
            const items = data;
            const songs = [], attachments = [];

            for (let i = 0; i < items.length; i++) {
                if (!items[i]) break;
                 const id = items[i].id.videoId;
                const info = await getVideoInfo(id);
                if (!info) continue;

                const duration = info.contentDetails.duration;
                songs.push({
                    id: id,
                    title: info.snippet.title,
                    duration: formatDuration(duration)
                });
            }

            const thumbnails = await downloadThumbnails(items.map(item => item.snippet.thumbnails.high.url));

            attachments.push(
                ...(thumbnails || [])
                    .map(path => global.reader(path))
            );

            if (!songs.length) return message.reply("No result found");

            const sendData = await message.reply({
                body: songs.map((song, index) => `${index + 1}. ${song.title} (${song.duration})`).join("\n\n"),
                attachment: attachments
            });

            for (let i = 0; i < thumbnails.length; i++) {
                try {
                    if (global.isExists(thumbnails[i])) global.deleteFile(thumbnails[i]);
                } catch (err) {
                    console.error(err);
                }
            }

            return sendData.addReplyEvent({ callback: chooseSong, songs });
        }

        const id = url.match(/(?:http(?:s):\/\/)?(?:www.|m.)?(?:youtu(?:be|.be))?(?:\.com)\/?(?:watch\?v=(?=\w.*))?([\w\.-]+)/)?.[1];
        if (!id) return message.reply("Invalid url");
        let info = await getVideoInfo(id);
        if (!info) return message.reply("No result found");
        const song = {
            title: info.snippet.title,
            id
        }

        await playMusic(message, song);
    } catch (err) {
        console.error(err);
        message.reply("An error occured");
    }
}

export default {
    config,
    onLoad,
    onCall
}
