import fs from 'fs';
import path from 'path';

// Root directory where your commands are stored
const commandRootDir = path.resolve('./plugins/commands');

// Recursively fetch all commands along with their categories
const fetchCommandFiles = () => {
    const commandFiles = [];

    const categories = fs.readdirSync(commandRootDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name); // Fetch category folder names

    for (const category of categories) {
        const commandDir = path.join(commandRootDir, category);
        const commands = fs.readdirSync(commandDir)
            .filter(file => file.endsWith('.js')) // Get only .js files
            .map(file => path.join(commandDir, file)); // Get full path for each command file

        if (commands.length > 0) {
            commandFiles.push({
                category,
                commands
            });
        }
    }

    return commandFiles;
};

// Load a command module from the specified file path and get its config.name
const loadCommand = async (filePath) => {
    try {
        const { default: commandModule } = await import(filePath);
        if (commandModule?.config?.name) {
            return { commandModule, name: commandModule.config.name };
        } else {
            console.warn(`Command config.name not found in ${filePath}`);
            return null;
        }
    } catch (error) {
        console.error(`Failed to load command from ${filePath}:`, error);
        return null;
    }
};

// Main handler for incoming messages
async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();

    // Dynamically fetch commands and their names
    const commandFiles = fetchCommandFiles();
    for (const { commands } of commandFiles) {
        for (const filePath of commands) {
            const commandData = await loadCommand(filePath);
            if (commandData && input.startsWith(commandData.name)) {
                const { commandModule, name } = commandData;

                if (commandModule?.config && commandModule.onCall) {
                    const args = input.slice(name.length).trim().split(" ");
                    const prefix = message.thread?.data?.prefix || global.config.PREFIX;

                    await commandModule.onCall({ 
                        message, 
                        args, 
                        data: { thread: { data: { prefix } } }, 
                        userPermissions: message.senderID, 
                        prefix 
                    });
                } else {
                    console.warn(`Command ${name} is not properly configured or missing onCall function.`);
                }
                return; // Exit loop once a matching command is found
            }
        }
    }

    console.warn('No matching command found.');
}

export default {
    onCall
};