import axios from 'axios';

const config = {
    name: "alldl",
    aliases: ["alldownload", "linkdownload"],
    description: "Download videos from various platforms including Facebook, Twitter, TikTok, Instagram, and Spotify.",
    usage: "[link]",
    category: "𝙼𝚎𝚖𝚋𝚎𝚛𝚜",
    cooldown: 5,
    permissions: [0, 1, 2],
    isAbsolute: false,
    isHidden: false,
    credits: "coffee",
};

const BASE_URLS = [
    'https://samirxpikachuio.onrender.com',
    'https://www.samirxpikachu.run.place',
    'http://samirxzy.onrender.com'
];

async function fetchContent(BASE_URL) {
    for (const url of BASE_URLS) {
        try {
            const response = await axios.get(`${url}${BASE_URL}`);
            return response.data; // Return the response data directly
        } catch (error) {
            console.error(`Error fetching from ${url}:`, error.message);
            continue; // Try the next URL
        }
    }
    throw new Error("All fallback URLs failed.");
}

/** @type {TOnCallCommand} */
async function onCall({ message, args }) {
    const link = args.join(" ");
    if (!link) {
        return message.send("Please provide the link.");
    }

    let BASE_URL;
    if (link.includes("facebook.com")) {
        BASE_URL = `/fbdl?vid_url=${encodeURIComponent(link)}`;
    } else if (link.includes("twitter.com")) {
        BASE_URL = `/twitter?url=${encodeURIComponent(link)}`;
    } else if (link.includes("tiktok.com")) {
        BASE_URL = `/tiktok?url=${encodeURIComponent(link)}`;
    } else if (link.includes("open.spotify.com")) {
        BASE_URL = `/spotifydl?url=${encodeURIComponent(link)}`;
    } else if (link.includes("instagram.com")) {
        BASE_URL = `/igdl?url=${encodeURIComponent(link)}`;
    } else {
        return message.send("Unsupported source.");
    }

    message.send("Processing your request.");

    try {
        const res = await fetchContent(BASE_URL);
        let contentUrl;

        // Extract content URL based on the platform
        if (link.includes("facebook.com")) {
            contentUrl = res.links["Download High Quality"];
        } else if (link.includes("twitter.com")) {
            contentUrl = res.HD;
        } else if (link.includes("tiktok.com")) {
            contentUrl = res.hdplay;
        } else if (link.includes("instagram.com")) {
            const mp4UrlObject = res.url.find(obj => obj.type === 'mp4');
            if (mp4UrlObject) {
                contentUrl = mp4UrlObject.url;
            }
        }

        if (contentUrl) {
            const response = await axios({
                url: contentUrl,
                method: 'GET',
                responseType: 'stream',
            });

            await message.send({ attachment: response.data });
        } else {
            message.send("Sorry, the content could not be found.");
        }
    } catch (error) {
        console.error("Error occurred during content fetching:", error);
        message.send("Sorry, the content could not be downloaded.");
    }
}

// Exporting the config and command handler as specified
export default {
    config,
    onCall,
};