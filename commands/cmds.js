const settings = require('../settings.json');
var sourceFile = require('../m8botbeta.js');

exports.run = (client, message, params) => {
  const Discord = require('discord.js');
  message.delete();
  const helpEmbed = new Discord.RichEmbed()
    .setTitle("M8 Bot Beta Help Version " + sourceFile.version)
    .setColor(0x9900FF)
    .setFooter("Sent via M8 Bot Beta", "http://i.imgur.com/nXvRJXM.png")
    .setThumbnail("http://i.imgur.com/nXvRJXM.png")
    .setTimestamp()
    .addField("Help Page", "A full list of commands can be found at https://m8bot.js.org/#info.")
  message.channel.send({
    embed: helpEmbed
  });
};

exports.conf = {
  enabled: true,
  guildOnly: false,
  aliases: ['c', 'commands', 'help', 'help m8bot', 'cmd'],
  permLevel: 0
};

exports.help = {
  name: 'cmds',
  description: 'Displays all the available commands for your permission level.',
  usage: 'cmds [command]',
};
