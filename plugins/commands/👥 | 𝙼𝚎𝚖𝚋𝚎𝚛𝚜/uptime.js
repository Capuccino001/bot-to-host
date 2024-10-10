import os from 'os';

const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "coffee"
}

function msToHMS(ms) {
    let seconds = Math.floor(ms / 1000);
    let days = Math.floor(seconds / 86400);
    seconds = seconds % 86400;
    let hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = Math.floor(seconds / 60);

    return {
        days: days,
        hours: hours,
        minutes: minutes
    };
}

function onCall({ message }) {
    const botUptime = msToHMS(process.uptime() * 1000);
    const serverUptime = msToHMS(os.uptime() * 1000); 

    message.reply(`────────────────\n»  (⁠ ⁠˘⁠ ⁠³⁠˘⁠)┌旦「 𝙾𝚗𝚕𝚒𝚗𝚎 」«\n[ 𝚂𝚎𝚛𝚟𝚎𝚛 ] ${serverUptime.days}D ${serverUptime.hours}H ${serverUptime.minutes}M\n[ 𝙱𝚘𝚝 ] ${botUptime.hours} Hours ${botUptime.minutes} minutes\n────── >ᴗ< ───────`);
}

export default {
    config,
    onCall
}
