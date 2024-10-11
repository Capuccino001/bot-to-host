import os from 'os';
import { execSync } from 'child_process';

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
        minutes: minutes,
        seconds: seconds
    };
}

function getSystemInfo() {
    const osType = os.type(); // OS type
    const osRelease = os.release(); // OS release version
    const arch = os.arch(); // Architecture
    const cpuInfo = execSync('lscpu').toString(); // CPU info

    // Extracting CPU details (assuming Linux)
    const cpuModelMatch = cpuInfo.match(/Model name:s+(.+)/);
    const cpuCoresMatch = cpuInfo.match(/CPU(s):s+(d+)/);
    
    const cpuModel = cpuModelMatch ? cpuModelMatch[1] : 'Unknown';
    const cpuCores = cpuCoresMatch ? cpuCoresMatch[1] : 'Unknown';

    return {
        os: `${osType} ${osRelease}`,
        arch: arch,
        cpu: `${cpuModel} (${cpuCores} cores)`
    };
}

function getMemoryInfo() {
    const totalMem = os.totalmem() / (1024 ** 3); // Convert to GB
    const freeMem = os.freemem() / (1024 ** 3); // Convert to GB
    const usedMem = totalMem - freeMem;

    return {
        used: usedMem.toFixed(2),
        total: totalMem.toFixed(2)
    };
}

function getDiskInfo() {
    const { execSync } = require('child_process');
    const diskInfo = execSync('df -h --total').toString().split('\n').pop().split(/\s+/);
    
    const usedDisk = diskInfo[2]; // Used space
    const totalDisk = diskInfo[1]; // Total space

    return {
        used: usedDisk,
        total: totalDisk
    };
}

function onCall({ message }) {
    const botUptime = msToHMS(process.uptime() * 1000);
    const serverUptime = msToHMS(os.uptime() * 1000);
    
    const systemInfo = getSystemInfo();
    const memoryInfo = getMemoryInfo();
    const diskInfo = getDiskInfo();

    message.reply(`★ 𝐒𝐲𝐬𝐭𝐞𝐦 𝐎𝐯𝐞𝐫𝐯𝐢𝐞𝐰 ★
-------------------------------------
⚙  𝐒𝐲𝐬𝐭𝐞𝐦 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐎𝐒: ${systemInfo.os}
  𝐀𝐫𝐜𝐡: ${systemInfo.arch}
  𝐂𝐏𝐔: ${systemInfo.cpu}
  𝐋𝐨𝐚𝐝 𝐀𝐯𝐠: ${(os.loadavg()[0]).toFixed(2)}%
-------------------------------------
💾 𝐌𝐞𝐦𝐨𝐫𝐲 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐌𝐞𝐦𝐨𝐫𝐲 𝐔𝐬𝐚𝐠𝐞: 
${memoryInfo.used} GB / Total ${memoryInfo.total} GB
-------------------------------------
💿 𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐈𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧:
  𝐃𝐢𝐬𝐤 𝐒𝐩𝐚𝐜𝐞 𝐔𝐬𝐚𝐠𝐞: 
${diskInfo.used} / Total ${diskInfo.total}
-------------------------------------
🤖 𝐁𝐨𝐭 𝐔𝚙𝚝𝚒𝚖𝚎: ${botUptime.hours}h ${botUptime.minutes}m ${botUptime.seconds}s
⚙  𝚂𝚎𝚛𝚟𝚎𝚛 𝚄𝚙𝚝𝚒𝚖𝚎: ${serverUptime.days}d ${serverUptime.hours}h ${serverUptime.minutes}m
📊  𝙿𝚛𝚘𝚌𝚎𝚜𝚜 𝙼𝚎𝚖𝚘𝚛𝚢 𝚄𝚜𝚊𝚐𝚎: 
${(process.memoryUsage().heapUsed / (1024 * 1024)).toFixed(2)} MB
-------------------------------------`);
}

export default {
    config,
    onCall
}
