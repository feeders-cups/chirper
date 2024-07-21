class TelegramHelper {
  constructor(token) {
    this.token = token;
  }

  parse(message) {
    const text = message.text.trim();
    const isCommand = text.startsWith('/');
    const tokens = text.split(/\s+/);

    return {
      isCommand,
      command: tokens[0].substring(1).toLowerCase(),
      tokens: tokens.slice(1)
    };
  }
}

module.exports = TelegramHelper;
