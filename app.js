const TelegramBot = require("node-telegram-bot-api");

const TOKEN =
  process.env.TELEGRAM_TOKEN ||
  "6798703589:AAGchuqNFIhX-I6zlJOcpU9fp_VIg4FhDqI";

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
  bot.sendMessage(msg.chat.id, " start menu ", opts);
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

  bot.onReplyToMessage(msg.chat.id, searchInput.message_id, (userSearch) => {
        bot.sendMessage(
          msg.chat.id,
          "got it"
        );
      });
});

bot.onText(/developer/, (msg) => {
  bot.sendMessage(msg.chat.id, "Developed By: Yididiya Kassahun\n\n ");
});

bot.onText(/back/, (msg) => {
  startMenu(msg);
});
