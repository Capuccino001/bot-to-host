import axios from "axios";
import fs from "fs";
import path from "path";

// Configuration object for the command
const config = {
  name: "gmage",
  aliases: ["gimg", "imgsearch"],
  description: "Searches for images based on a query.",
  usage: "[query] -[number of images]",
  cooldown: 3,
  permissions: [1, 2],
  credits: "Coffee",
  extra: {
    defaultCount: 12, // Default number of images to fetch
    cacheDir: "./plugins/commands/cache", // Directory for caching images
  },
};

// Main function executed when the command is called
async function onCall({ message, args }) {
  const query = args.slice(0, -1).join(" ");
  let imageCount = config.extra.defaultCount;

  // Check if the last argument is a number for the image count
  const lastArg = args[args.length - 1];
  if (lastArg && !isNaN(lastArg)) {
    imageCount = Math.min(parseInt(lastArg), 12); // Set image count (max 12)
  }

  // Error handling for empty query
  if (!query) return message.reply("Please provide a query.");

  await message.react("🕰️"); // Indicate that processing is happening

  try {
    // Fetch image URLs from the API
    const apiUrl = `https://openapi-idk8.onrender.com/google/image?search=${encodeURIComponent(
      query
    )}&count=${imageCount}`;
    const { data } = await axios.get(apiUrl);
    const allImages = data.images || [];

    if (allImages.length === 0) {
      return message.reply("No images were found for your query.");
    }

    // Download images and get their file paths
    const filePaths = await downloadImages(allImages);

    // Reply to the message with the downloaded images
    await message.reply({
      content: `Here are ${allImages.length} images for your search: ${query}`,
      attachments: filePaths.map((filePath) => fs.createReadStream(filePath)),
    });

    await message.react("✅"); // Success reaction

    // Cleanup downloaded images after sending
    cleanupFiles(filePaths);
  } catch (error) {
    console.error(error);
    await message.react("❎"); // Error reaction
    await message.reply("An error occurred while fetching the images.");
  }
}

// Function to download images from URLs and save them locally
async function downloadImages(imageUrls) {
  const filePaths = [];
  const downloadPromises = imageUrls.map(async (imageUrl, index) => {
    const imagePath = path.join(config.extra.cacheDir, `image${index}.jpg`);

    // Download the image and save it locally
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });

    // Write the image stream to a file
    const writer = fs.createWriteStream(imagePath);
    response.data.pipe(writer);

    // Ensure the image is fully downloaded before proceeding
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    filePaths.push(imagePath); // Add to filePaths array
  });

  await Promise.all(downloadPromises); // Wait for all images to be downloaded
  return filePaths; // Return the array of file paths
}

// Function to clean up downloaded images
function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file ${filePath}:`, err);
    });
  });
}

export default {
  config,
  onCall,
};