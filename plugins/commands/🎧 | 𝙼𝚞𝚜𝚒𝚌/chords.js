const config = {
    name: "chords",
    aliases: ["chord"],
    description: "Search for chords by title or artist.",
    usage: "[query]",
    cooldown: 5,
    permissions: [0],
    credits: "Coffee",
};

const fetchChords = async (query) => {
    const apiUrl = `https://deku-rest-api.ooguy.com/search/chords?q=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data.chord || null;
};

async function onCall({ message, args }) {
    if (!args.length) {
        return message.reply("Please provide a song title or artist to search for chords.");
    }

    const query = args.join(" ");
    
    try {
        const chordData = await fetchChords(query);
        
        if (chordData) {
            const { title, artist, chords } = chordData;
            const replyMessage = `
🎧 | Title: ${title}
🎤 | Artist: ${artist}
・───── >ᴗ< ──────・
${chords}
・──────────────・
            `;
            message.reply(replyMessage);
        } else {
            message.reply("No chords found for your search query.");
        }
    } catch (error) {
        console.error("Chords fetch error:", error.message);
        message.reply("An error occurred while fetching chords. Please try again later.");
    }
}

export default {
    config,
    onCall,
};