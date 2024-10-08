import fs from "fs";

const config = {
    name: "wordgame",
    aliases: ["wg"],
    description: "Unscramble the word game.",
    usage: "[start]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "AceGerome/coffee", 
};

const shuffleWord = (word) => {
    const shuffled = word.split('').sort(() => 0.5 - Math.random()).join('');
    if (shuffled === word) {
        return shuffleWord(word);
    }
    return shuffled;
};

const formatText = (text) => {
    return text.normalize("NFD").toLowerCase();
};

let currentGame = null;

// Start the word game
async function onCall({ message, args }) {
    const words = JSON.parse(fs.readFileSync('words.json'));
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];
    const shuffledWord = shuffleWord(randomWord);

    currentGame = {
        index: randomIndex,
        uid: message.senderID,
    };

    const msg = await message.reply(`Unscramble this word: "${shuffledWord}"`);

    // Attach reply event handler for user's answer
    msg.addReplyEvent({
        callback: onReply,
        type: "message",
    });
}

// Handle user replies to the word game
async function onReply({ eventData, message }) {
    if (eventData.type !== "message") return;

    if (!currentGame || currentGame.uid !== message.senderID) return;

    const words = JSON.parse(fs.readFileSync('words.json'));
    const correctAnswer = words[currentGame.index];
    const { body: userAnswer } = message;

    if (formatText(userAnswer) === formatText(correctAnswer)) {
        const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
        await message.reply(`Correct! You win and earned ${reward} coins!`);
    } else {
        await message.reply("Incorrect answer. Try again!");
    }

    currentGame = null;
}

export default {
    config,
    onCall,
};
