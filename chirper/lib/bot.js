// Filename: main.js

const { Bot } = require('grammy');
const { Vonage } = require('@vonage/server-sdk');
const TelegramHelper = require('./TelegramHelper');
const NexmoHelper = require('./NexmoHelper');
const NexmoHelperError = require('./NexmoHelperError');
var pkgJson = require(__dirname + '/../package.json');
const config = require('./config');

console.log(`CHIRPER Bot v${pkgJson.version} is running`);

const bot = new Bot(config.TELEGRAM_BOT_TOKEN);

const vonage = new Vonage({
  apiKey: config.VONAGE_API_KEY,
  apiSecret: config.VONAGE_API_SECRET,
  applicationId: config.VONAGE_APP_ID,
  privateKey: config.VONAGE_PRIVATE_KEY
}, { debug: true });

const telegramHelper = new TelegramHelper(bot.token);

bot.command('start', (ctx) => ctx.reply('Welcome to Chirper OTP bypass Bot!'));
bot.command('help', (ctx) => ctx.reply(NexmoHelper.HELP_MSG));

bot.on('message:text', async (ctx) => {
  const message = ctx.message;
  const parsedMessage = telegramHelper.parse(message);

  if (parsedMessage.isCommand) {
    const nexmoHelper = new NexmoHelper(bot, vonage, config);

    try {
      await nexmoHelper.handleMessage({ ...parsedMessage, channel: message.chat.id });
    } catch (error) {
      if (error instanceof NexmoHelperError) {
        await ctx.reply(`<b>[CAUTION!]⚠️:</b> There was a problem handling the message \`${message.text}\`\nThe error was \`${error.message}\``, {
          parse_mode: 'HTML',
        });
      } else {
        console.error(error);
        await ctx.reply('<b>[CAUTION!]⚠️:</b> An unexpected error occurred. Please contact your nearest Ch1rp3r Communications specialist.', {
          parse_mode: 'HTML',
        });
      }
    }
  }
});

// Global error handler using bot.catch
bot.catch((err, ctx) => {
  // Check if ctx and ctx.update are defined
  const updateId = ctx && ctx.update ? ctx.update.update_id : 'unknown';
  console.error(`Error in update ${updateId}:`, err);
  // Handle the error or reply to the user accordingly
 });

bot.start();
