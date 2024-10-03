import fs from 'fs';
import path from 'path';

// Define the base directory where the commands are located (update to match your structure)
const commandsDir = path.join(__dirname, 'plugins/commands');

// Recursively fetch all command files from the directory
const getCommandFiles = (dir) => {
    return fs.readdirSync(dir).reduce((files, file) => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            return files.concat(getCommandFiles(fullPath));  // Traverse subdirectories
        } else if (file.endsWith('.js')) {
            return files.concat(fullPath);  // Include only JavaScript files
        } else {
            return files;
        }
    }, []);
};

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

// Get all command files dynamically
const loadCommands = async () => {
    const commandFiles = getCommandFiles(commandsDir);

    const commandsWithPaths = await Promise.all(
        commandFiles.map(async (filePath) => {
            const commandModule = await loadCommand(`file://${filePath}`);

            if (commandModule?.config && commandModule.config.name) {
                return {
                    path: filePath,
                    name: commandModule.config.name
                };
            }
            return null;
        })
    );

    // Filter out null values (invalid or missing commands)
    return commandsWithPaths.filter(Boolean);
};

// Main handler for incoming messages
async function onCall({ message }) {
    const input = message.body.trim().toLowerCase();
    const commandFilesWithPaths = await loadCommands();  // Load command files dynamically

    const commandEntry = commandFilesWithPaths.find(({ name }) => input.startsWith(name));

    if (commandEntry) {
        const { path, name } = commandEntry;
        const command = await loadCommand(`file://${path}`);

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