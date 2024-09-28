const commandFiles = [
    { category: "📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗", commands: ['ai', 'blackbox', 'copilot', 'gpt', 'translate'] },
    { category: "🖼 | 𝙸𝚖𝚊𝚐𝚎", commands: ['imagine', 'pinterest', 'removebg', 'remini'] },
    { category: "🎧 | 𝙼𝚞𝚜𝚒𝚌", commands: ['lyrics', 'spotify', 'chords'] },
    { category: "👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜", commands: ['tempmail', 'tid', 'uid', 'unsend', 'help', 'alldl', 'font', 'adduser'] }
];

const commandFilesWithPaths = commandFiles.flatMap(({ category, commands }) =>
    commands.map(command => ({
        path: `../commands/${category}/${command}.js`,
        name: command
    }))
);

const loadCommand = async filePath => {
    try {
        const { default: commandModule } = await import(filePath);
        return commandModule;
    } catch {
        return null;
    }
};

async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFilesWithPaths.find(({ name }) => input.startsWith(name));
    
    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command?.config) {
            const args = input.slice(name.length).trim().split(" ");
            const prefix = message.thread?.data?.prefix || global.config.PREFIX;
            
            if (command.onCall) {
                await command.onCall({ 
                    message, 
                    args, 
                    data: { thread: { data: { prefix } } }, 
                    userPermissions: message.senderID, 
                    prefix 
                });
            }
        }
    }
}

export default {
    onCall
};
