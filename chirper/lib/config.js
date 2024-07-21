const config = {
 TELEGRAM_BOT_TOKEN: null,
 CALLER_ID: null,
 VONAGE_API_KEY: null,
 VONAGE_API_SECRET: null,
 VONAGE_APP_ID: null,
 VONAGE_PRIVATE_KEY: null,
 BASE_URL: null,
 MONGO_URL: null
}

const configErrors = [];

Object.keys(config).forEach((key) => {
 let configValue = process.env[key];
 if(!configValue) {
   configErrors.push(key);
 }
 else {
   config[key] = configValue;
 }
});

if(configErrors.length) {
 throw new Error(`Some required environmental variables were not found: ${configErrors.join(',')}`);
}

config.CALLER_ID = 
config.CALLER_ID.split(',');

module.exports = config;
