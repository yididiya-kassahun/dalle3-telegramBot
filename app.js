const TelegramBot = require("node-telegram-bot-api");
const OpenAIApi = require("openai");
let fs = require("fs");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();

const TOKEN = "6798703589:AAGchuqNFIhX-I6zlJOcpU9fp_VIg4FhDqI";

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
  const searchInput = await bot.sendMessage(
    msg.chat.id,
    "Enter your prompt and i'll give you the generated image \n\n ",
    {
      reply_markup: {
        force_reply: true,
      },
    }
  );

  bot.onReplyToMessage(
    msg.chat.id,
    searchInput.message_id,
    async (userSearch) => {
      //  console.log(userSearch.text);
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

         bot.sendMessage(
           msg.chat.id,
           "Generating the image 🌌 please wait a few seconds ⏳ ...\n\n "
         );

    }
  );
});

bot.onText(/developer/, (msg) => {
  bot.sendMessage(msg.chat.id, "Developed By: Yididiya Kassahun\n\n ");
});

bot.onText(/back/, (msg) => {
  startMenu(msg);
});

// Function to download and save the image
async function downloadImage(url, filename) {
  const imagePath = path.join(__dirname, ".temp", filename);

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
