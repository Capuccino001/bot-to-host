import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
  name: 'example',
  aliases: ['ex'],
  version: '1.0',
  credits: 'Your Name',
  description: 'Example command template',
  usages: '<query>',
  category: 'Example',
  cooldown: 10,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = `${__dirname}/cache`;

// Ensure the cache folder exists
const ensureCacheFolderExists = async () => {
  try {
    await fs.ensureDir(cacheFolder);
  } catch (error) {
    console.error('Error creating cache folder:', error);
  }
};

// Placeholder API URL
const apiURL = 'https://example-api.com/api';

// Placeholder API endpoint
const apiEndpoint = '/example-endpoint';

// API request function
const makeApiRequest = async (query) => {
  try {
    const response = await axios.get(`${apiURL}${apiEndpoint}`, {
      params: {
        query,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error making API request:', error);
    throw error;
  }
};

// Main function
const onCall = async ({ message, args, getLang }) => {
  try {
    const query = args.join(' ');

    if (!query) {
      const errorMessage = `${getLang('message')}`;
      return message.reply(errorMessage);
    }

    await ensureCacheFolderExists();
    await message.react('🕰️');

    const apiResponse = await makeApiRequest(query);
    const result = apiResponse.result;

    if (!result) {
      const errorMessage = 'No result found';
      return message.reply(errorMessage);
    }

    const successMessage = `Result: ${result}`;
    await message.reply(successMessage);

    console.log('API response sent successfully.');
  } catch (error) {
    console.error('Error occurred:', error);
    const errorMessage = `An error occurred: ${error.message}`;
    await message.reply(errorMessage);
  }
};

export default {
  config,
  onCall,
};
