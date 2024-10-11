import os from 'os';

const config = {
    name: "system",
    aliases: ["sys"],
    credits: "coffee"
}

function msToHMS(ms) {
    let seconds = Math.floor(ms / 1000);
    let days = Math.floor(seconds / 86400);
    seconds = seconds % 86400;
    let hours = Math.floor(seconds / 3600);
    seconds = seconds % 3600;
    let minutes = Math.floor(seconds / 60);
    let secondsRemaining = seconds % 60;

    return {
        days: days,
        hours: hours,
        minutes: minutes,
        seconds: secondsRemaining
    };
}

function getMemoryUsage() {
    const memory = process.memoryUsage();
    return {
        heapTotal: memory.heapTotal / (1024 * 1024 * 1024),
        heapUsed: memory.heapUsed / (1024 * 1024 * 1024),
        rss: memory.rss / (1024 * 1024 * 1024)
    };
}

function getDiskUsage() {
    const disk = os.totalmem();
    const free = os.freemem();
    return {
        total: disk / (1024 * 1024 * 1024),
        used: (disk - free) / (1024 * 1024 * 1024)
    };
}

function onCall({ message }) {
    const botUptime = msToHMS(process.uptime() * 1000);
    const serverUptime = msToHMS(os.uptime() * 1000);
    const memoryUsage = getMemoryUsage();
    const diskUsage = getDiskUsage();

      message.reply(`★ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰 ★
-------------------------------------
⚙  𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐎𝐒: ${os.type()}
  𝐀𝐫𝐜𝐡: ${os.arch()}
  𝐂𝐏𝐔: ${os.cpus()[0].model}
  𝐋𝐨𝐚𝐝 𝐀𝐯𝐠: ${os.loadavg()[0].toFixed(2)}%
-------------------------------------
💾 𝐌𝐞𝐦𝐨𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: 
${memoryUsage.heapUsed.toFixed(2)} GB / Total ${memoryUsage.heapTotal.toFixed(2)} GB
  𝐑𝐀𝐌 𝐔𝐬𝐚𝐠𝐞: 
${memoryUsage.rss.toFixed(2)} GB / Total ${memoryUsage.heapTotal.toFixed(2)} GB
-------------------------------------
💿 𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐔𝐬𝐚𝐠𝐞: 
${diskUsage.used.toFixed(2)} GB / Total ${diskUsage.total.toFixed(2)} GB
-------------------------------------
🤖 𝐁𝐨𝐭 𝐔𝐩𝐭𝐢𝐦𝐞: ${botUptime.hours}h ${botUptime.minutes}m ${botUptime.seconds}s
⚙ 𝐒𝐞𝐫𝐯𝐞𝐫 𝐔𝐩𝐭𝐢𝐦𝐞: ${serverUptime.days}d ${serverUptime.hours}h ${serverUptime.minutes}m
📊 𝐏𝐫𝐨𝐜𝐞𝐬𝐬 𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: 
${memoryUsage.heapUsed.toFixed(2)} MB
-------------------------------------`);
}

export default {
    config,
    onCall
}
