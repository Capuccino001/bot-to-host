const commandFiles = [
    { category: "📖 | 𝙴𝚍𝚞𝚌𝚊𝚝𝚒𝚘𝚗", commands: ['ai', 'blackbox', 'copilot', 'gemini', 'gpt', 'translate'] },
    { category: "🖼 | 𝙸𝚖𝚊𝚐𝚎", commands: ['imagine', 'pinterest', 'removebg', 'remini'] },
    { category: "🎧 | 𝙼𝚞𝚜𝚒𝚌", commands: ['lyrics', 'spotify', 'chords'] },
    { category: "👥 | 𝙼𝚎𝚖𝚋𝚎𝚛𝚜", commands: ['tempmail', 'tid', 'uid', 'unsend', 'help', 'alldl', 'font', 'adduser'] }
];

// Flatten the command files into an array of objects with paths and names
const commandFilesWithPaths = commandFiles.flatMap(({ category, commands }) =>
    commands.map(command => ({
        path: `../commands/${category}/${command}.js`,
        name: command
    }))
);

// Load a command module from the specified file path
const loadCommand = async (filePath) => {
    try {
        const { default: commandModule } = await import(filePath);
        return commandModule;
    } catch (error) {
        console.error(`Failed to load command from ${filePath}:`, error);
        return null;
    }
};

// Main handler for incoming messages
async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandEntry = commandFilesWithPaths.find(({ name }) => input.startsWith(name));

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(path);

        if (command?.config && command.onCall) {
            const args = input.slice(name.length).trim().split(" ");
            const prefix = message.thread?.data?.prefix || global.config.PREFIX;

            await command.onCall({ 
                message, 
                args, 
                data: { thread: { data: { prefix } } }, 
                userPermissions: message.senderID, 
                prefix 
            });
        } else {
            console.warn(`Command ${name} is not properly configured or missing onCall function.`);
        }
    }
}

export default {
    onCall
};