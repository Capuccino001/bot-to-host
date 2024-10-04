const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "XaviaTeam"
}

function msToHMS(ms) {
    let seconds = Math.floor(ms / 1000);
    let hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = Math.floor(seconds / 60);
    seconds = seconds % 60;

    return `${hours} Hrs ${minutes} mins ${seconds} secs...`;
}

function onCall({ message }) {
    let uptime = msToHMS(process.uptime() * 1000);
    message.reply(`(⁠ ⁠˘⁠ ⁠³⁠˘⁠)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」\n${uptime}`);
}

export default {
    config,
    onCall
}