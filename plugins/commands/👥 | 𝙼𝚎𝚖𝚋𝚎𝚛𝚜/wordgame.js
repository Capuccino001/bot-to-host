import fs from "fs";

const config = {
    name: "wordgame",
    aliases: ["wg"],
    description: "Unscramble the word game.",
    usage: "[start]",
    cooldown: 5,
    permissions: [1, 2],
    credits: "AceGerome",
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

// Start the word game
async function onCall({ message, args }) {
    const words = JSON.parse(fs.readFileSync('words.json'));
    const randomWord = words[Math.floor(Math.random() * words.length)];
    const shuffledWord = shuffleWord(randomWord);

    await message.reply(`Unscramble this word: "${shuffledWord}"`);

    // Attach reply event handler for user's answer
    message.addReplyEvent({
        callback: onReply,
        type: "message",
        answer: randomWord,
        uid: message.senderID,
    });
}

// Handle user replies to the word game
async function onReply({ eventData, message, callbackData }) {
    if (eventData.type !== "message") return;

    const { body: userAnswer } = message;
    const correctAnswer = callbackData.answer;

    if (formatText(userAnswer) === formatText(correctAnswer)) {
        const reward = Math.floor(Math.random() * (100 - 50 + 1) + 50);
        await message.reply(`Correct! You win and earned ${reward} coins!`);
    } else {
        await message.reply("Incorrect answer. Try again!");
    }
}

export default {
    config,
    onCall,
};