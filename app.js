const TelegramBot = require("node-telegram-bot-api");
const gtts = require("node-gtts")("en");
const OpenAIApi = require("openai");
let fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const TOKEN = "";

// *********** OpenAI

const openai = new OpenAIApi({
  api_key: process.env.OPENAI_API_KEY,
});

// ************* Bot
const bot = new TelegramBot(TOKEN, { polling: true });

function startMenu(msg) {
  const opts = {
    reply_markup: JSON.stringify({
      keyboard: [
        [{ text: "🌌 Img Generate" }, { text: "👨🏽‍💻 developer" }],
        [{ text: "Back" }],
      ],
      resize_keyboard: true,
      one_time_keyboard: true,
    }),
  };
  bot.sendMessage(msg.chat.id, "Image Generator Bot Using DALL.E 3", opts);
}

bot.onText(/start/, (msg) => {
  console.log("=============" + msg.chat.first_name);
  startMenu(msg);
});

bot.onText(/Img Generate/, async (msg) => {
  await bot
    .sendMessage(
      msg.chat.id,
      "Enter your prompt and i'll give you the generated image \n\n ",
      {
        reply_markup: {
          force_reply: true,
        },
      }
    )
    .then((searchInput) => {
      bot.onReplyToMessage(
        msg.chat.id,
        searchInput.message_id,
        async (userSearch) => {
          //  console.log(userSearch.text);
          bot.sendMessage(
            msg.chat.id,
            "Generating the image 🌌 please wait a few seconds ⏳ ...\n\n "
          );

          const generatedImage = await openai.images.generate({
            model: "dall-e-3",
            prompt: userSearch.text,
            n: 1,
            size: "1024x1024",
          });

          let image_url = generatedImage.data[0].url;
          let revisedPrompt = generatedImage.data[0].revised_prompt;

          console.log(image_url);
          console.log(revisedPrompt);

          await downloadImage(image_url, "download.jpg")
            .then((imagePath) => {
              console.log(`Image downloaded at: ${imagePath}`);

              bot.sendPhoto(msg.chat.id, imagePath);

              fs.unlink(imagePath, (err) => {
                if (err) throw err;
              });
            })
            .catch((error) => {
              console.error("Error downloading the image:", error);
            });

          await generateAudio(msg.chat.id, revisedPrompt)
            .then((audioPath) => {
              console.log("Audio path is " + audioPath);
              bot.sendAudio(msg.chat.id, audioPath, {
                caption:
                  "🔰 Title: Generated Audio for the AI Image \n 📁 File: MP3 \n",
              });
              fs.unlink(audioPath, (err) => {
                if (err) throw err;
              });
            })
            .catch((error) => {
              console.error("Error generating or sending the audio:", error);
              // Handle the error appropriately (e.g., send a message to the user)
            });
        }
      );
    });
});

bot.onText(/developer/, (msg) => {
  bot.sendMessage(msg.chat.id, "Developed By: Yididiya Kassahun\n\n ");
});

bot.onText(/back/, (msg) => {
  startMenu(msg);
});

// Function to download and save the image
async function downloadImage(url, filename) {
  const imagePath = path.join(__dirname, ".temp/image", filename);

  const response = await axios({
    method: "get",
    url: url,
    responseType: "stream",
  });

  const writer = fs.createWriteStream(imagePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(imagePath));
    writer.on("error", reject);
  });
}

// Function to generate audio based on the description

function generateAudio(chatId, description) {
  return new Promise((resolve, reject) => {
    const audioPath = path.join(
      __dirname,
      ".temp/audio",
      `${chatId}-audio.mp3`
    );

    // cheching if directory exists
    fs.mkdirSync(path.dirname(audioPath), { recursive: true });

    const reScript = "Here is the description of the image: " + description;

    // Save the audio file
    gtts.save(audioPath, reScript, function (err, result) {
      if (err) {
        reject(err);
      } else {
        // Check if the file exists and is not empty
        if (fs.existsSync(audioPath) && fs.statSync(audioPath).size > 0) {
          resolve(audioPath);
        } else {
          reject(new Error("Audio file is empty or does not exist"));
        }
      }
    });
  });
}
