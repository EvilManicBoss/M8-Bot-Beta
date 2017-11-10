var version = "1.0.1"
var website = "https://m8bot.js.org/";
var botTwitter = "https://twitter.com/M8_Bot"
var officialDiscord = "https://discord.me/m8bot"
var embedColor = 0x9900FF;
var botLogo = "https://imgur.com/a/Y8g0S";

module.exports.version = version;
module.exports.website = website;
module.exports.botTwitter = botTwitter;
module.exports.officialDiscord = officialDiscord;
module.exports.botLogo = botLogo;

const Discord = require('discord.js');
const client = new Discord.Client();
const settings = require('./settings.json');
const chalk = require('chalk');
const fs = require('fs');
const moment = require('moment');
const Carina = require('carina').Carina;
const ws = require('ws');

const log = message => {
  console.log(`[${moment().format('YYYY-MM-DD HH:mm:ss')}] ${message}`);
};

client.on('ready', () => {
  client.user.setGame(`${settings.prefix}help | m8bot.js.org`);
  client.user.setStatus(`dnd`);
  //setStatus only accepts 'online', 'idle', 'dnd' and 'invisible', everything
  //else will not work.
  //client.user.setGame(`Version ${version}`)
  //client.user.setGame(`${settings.prefix}help | m8bot.js.org`);
  //client.user.setGame(`Out of Service`);

});

//client.on('message', message => {
  //const swearWords = ["darn", "Darn", "shit", "Shit", "cunt", "Cunt", "gay", "Gay", "faggot", "Faggot", "9/11", "prick", "Prick", "nigger", "Nigger", "nigga", "Nigga", "dick", "Dick", "dickhead", "Dickhead"];
  //if (message.author.bot) return;
  //if( swearWords.some(word => message.content.includes(word)) && message.author.id != "161556067954720768" && !message.member.hasPermission("ADMINISTRATOR") ){
 //message.reply("Oh no you said a bad word! You're message has been deleted");
 //return message.delete().catch(err => err = "Not gonna bother with errors");
//}
  //if (!message.content.startsWith(settings.prefix)) return;
  //let command = message.content.split(' ')[0].slice(settings.prefix.length);
  //let params = message.content.split(' ').slice(1);
  //let perms = client.elevation(message);
  //let cmd;
  //if (client.commands.has(command)) {
    //cmd = client.commands.get(command);
  //} else if (client.aliases.has(command)) {
    //cmd = client.commands.get(client.aliases.get(command));
  //}
  //if (cmd) {
    //if (perms < cmd.conf.permLevel) return;
    //cmd.run(client, message, params, perms);
  //}
//});

client.on('message', message => {
  //if (message.author.bot) return;
  if (!message.content.startsWith(settings.prefix)) return;
  let command = message.content.split(' ')[0].slice(settings.prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
});

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir('./commands/', (err, files) => {
  if (err) console.error(err);
  log(`Loading a total of ${files.length} commands.`);
  files.forEach(f => {
    if (f != ".DS_Store") {
      let props = require(`./commands/${f}`);
      log(`Loading Command: ${props.help.name}. Completed`);
      client.commands.set(props.help.name, props);
      props.conf.aliases.forEach(alias => {
        client.aliases.set(alias, props.help.name);
      });
    }
  });
});

client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./commands/${command}`)];
      let cmd = require(`./commands/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

client.elevation = message => {
  /* This function should resolve to an ELEVATION level which
     is then sent to the command handler for verification*/
  let permlvl = 0;
  // let mod_role = message.guild.roles.find('name', settings.modrolename);
  // if (mod_role && message.member.roles.has(mod_role.id)) permlvl = 2;
  // let admin_role = message.guild.roles.find('name', settings.adminrolename);
  // if (admin_role && message.member.roles.has(admin_role.id)) permlvl = 3;
  if (message.author.id === settings.ownerid) permlvl = 4;
  if (message.author.id === settings.ownerid2) permlvl = 4;
  return permlvl;
};


var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });

client.on('warn', e => {
  console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});

client.on('error', e => {
  console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

Carina.WebSocket = ws;
const ca = new Carina({
  isBot: true
}).open();

//Start Mixer
var streamers = fs.readFileSync("./streamers.txt", "utf-8").split(", ");;
var streamerCount = streamers.length;

for (i = 0; i < streamerCount; i++) { //Run for the # of streamers
  var halfHour = 1800000; //time in milis that is 30min
  var bootTime = (new Date).getTime(); //get the time the bot booted up
  var halfHourAgo = bootTime - 1800000; //get the time 30min before the boot
  // fs.writeFile("./user_time/" + streamers[i] + "_time.txt", halfHourAgo); //write a file with
  var request = require("request"); //the var to request details on the streamer
  request("https://mixer.com/api/v1/channels/" + streamers[i], function(error, response, body) { //ste info for the streamer in JSON
    if (!error && response.statusCode == 200) { //if there is no error checking
      var mixerInfo = JSON.parse(body); //setting a var for the JSON info
      const mixerID = mixerInfo.id; //getting the ID of the streamer
      console.log(chalk.cyan("Now stalking " + mixerInfo.token + " on mixer!")); //logs that the bot is watching for the streamer to go live
      ca.subscribe(`channel:${mixerID}:update`, data => { //subscribing to the streamer
        var mixerStatus = data.online //checks if they are online (its a double check just incase the above line miss fires)
        if (mixerStatus == true) { //if the bam info JSON says they are live
          var liveTime = (new Date).getTime(); //time the bot sees they went live
          var lastLiveTime = fs.readFileSync("./user_time/" + mixerInfo.token + "_time.txt", "utf-8"); //checks the last live time
          var timeDiff = liveTime - lastLiveTime; //gets the diff of current and last live times
          //console.log(timeDiff);
          if (timeDiff >= halfHour) { //if its been 30min or more
            console.log(chalk.cyan(mixerInfo.token + " went live, as its been more than 30min!")); //log that they went live
            const hook = new Discord.WebhookClient(settings.liveID, settings.hookToken); //sets info about a webhook
            hook.sendMessage("!live " + mixerInfo.token); //tells the webhook to send a message to a private channel that M8Bot is listening to
          }
          if (timeDiff < halfHour) { //if its been less than 30min
            console.log(mixerInfo.token + " attempted to go live, but its been under 30min!"); //log that its been under 30min
          }
          fs.writeFile("./user_time/" + mixerInfo.token + "_time.txt", liveTime); //update last live time regardless if they went live or not
        }
      })
    }
  });
}
//End Mixer

//Start Twitch
var streamersTwitch = fs.readFileSync("./streamersTwitch.txt", "utf-8").split(", ");
var streamerCountTwitch = streamersTwitch.length;

for (t = 0; t < streamersTwitch.length; t++) {
  var bootTime = (new Date).getTime(); //get the time the bot booted up
  var halfHourAgo = bootTime - 1800000; //get the time 30min before the boot
  // fs.writeFile("./user_time_twitch/" + streamersTwitch[t] + "_time.txt", halfHourAgo);
  console.log(chalk.rgb(148, 0, 211)("Now stalking " + streamersTwitch[t] + " on Twitch!"))
}

function twitchCheck() {
  console.log("Checking Twitch!")
  for (tc = 0; tc < streamersTwitch.length; tc++) {
    var liveTime = (new Date).getTime();
    var lastLiveTime = fs.readFileSync("./user_time_twitch/" + streamersTwitch[tc] + "_time.txt", "utf-8");
    var timeDiff = liveTime - lastLiveTime;
    if (timeDiff >= halfHour) { //if its been 30min or more
      var request = require("request"); //the var to request details on the streamer
      request("https://api.twitch.tv/kraken/streams/" + streamersTwitch[tc] + "?client_id=" + settings.twitch_id, function(error, response, body) {
        if (!error && response.statusCode == 200) { //if there is no error
          var twitchInfo = JSON.parse(body);
          if (twitchInfo.stream == null) {
            //console.log(twitchInfo._links.self.replace("https://api.twitch.tv/kraken/streams/", "") + " is not live!")
            //console.log(twitchInfo)
          } else {
            var liveTime = (new Date).getTime();
            var streamStartTime = new Date(twitchInfo.stream.created_at)
            var streamStartMS = streamStartTime.getTime()
            if (liveTime - streamStartMS < 1800000) {
              console.log(chalk.rgb(148, 0, 211)(twitchInfo.stream.channel.name + " went live on Twitch, as its been more than 30min!"));
              fs.writeFile("./user_time_twitch/" + twitchInfo.stream.channel.name + "_time.txt", liveTime); //update last live time
              const hook = new Discord.WebhookClient(settings.liveID, settings.hookToken); //sets info about a webhook
              hook.sendMessage("!live-twitch " + twitchInfo.stream.channel.name);
              //console.log(twitchInfo)
            }
          }
        }
      });
    }
    if (timeDiff < halfHour) { //if its been less than 30min
    }
  }
}
const delay = require('delay');
delay(60000).then(() => {
  twitchCheck()
})

setInterval(twitchCheck, 120000); //run the check every 2min

//End Twitch

client.on("guildMemberAdd", member => {
  let guild = member.guild;
  var guildID = member.guild.id;
  //var guildGeneral = member.guild.defaultChannel.id;
  //console.log(guildGeneral);
  //console.log(guildID);
  if (guildID == "250354580926365697") { //Meme M8s Guild ID
    member.addRole(guild.roles.find('name', 'Lil Meme'));
    //client.channels.get(guildGeneral).sendMessage("Hey " + member.displayName + ", welcome to the **Chill Spot**! You are now a Lil Meme. Please read #welcome and enjoy your stay!");
    //client.channels.get(guildGeneral).send("Hey " + member.name)
  }
  if (guildID == "169960109072449536") { //Buttercup_'s Guild ID
    member.addRole(guild.roles.find('name', 'Citizens of Townsville'));
  }
  if (guildID == "352984490693623829") { //M8 Bot Server Guild ID
    member.addRole(guild.roles.find('name', 'Member'));
    //client.channels.get(guildGeneral).send("Hey " + member.name + "! Welcome to the official M8 Bot server! Please read #welcome and if you need any help, ask in #support!")
  }
});

client.on("guildCreate", guild => {
  console.log("I just joined a new server called " + guild.name)
  guild.defaultChannel.send("Hey guys and gals! I\'m M8 Bot! Its great to meet you all, and I hope you enjoy me :P\nA list of my commands can be found by using \"!help m8bot\".\nIf you encounter any issues, you can type \"!m8bug\" to recive links to submit issues!")

  const joinedEmbed = new Discord.RichEmbed()
    .setColor(0x00FF00)
    .setTitle("Joined " + guild.name)
    .setFooter("Sent via M8 Bot", botLogo)
    .setTimestamp()
    .setThumbnail(guild.iconURL)
    .addField("Members", guild.memberCount, true)
    .addField("Owner", guild.owner, true)
  client.channels.get("375111766276964357").sendEmbed(joinedEmbed)

});

client.on("guildDelete", guild => {
  const leftEmbed = new Discord.RichEmbed()
    .setColor(0xFF0000)
    .setTitle("Left " + guild.name)
    .setFooter("Sent via M8 Bot", botLogo)
    .setTimestamp()
    .setThumbnail(guild.iconURL)
    .addField("Members", guild.memberCount, true)
    .addField("Owner", guild.owner, true)
  client.channels.get("375111766276964357").sendEmbed(leftEmbed)

});

process.on('unhandledRejection', error => {
  console.error(`Uncaught Promise Error: \n${error.stack}`);
});



client.login(settings.token);
