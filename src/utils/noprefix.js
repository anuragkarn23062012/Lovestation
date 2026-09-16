const { EmbedBuilder, PermissionsBitField } = require('discord.js");
const noPrefixSchema = require('../Schemas.js/noPrefixSchema');

const autorizedusers = ['1305113053653893182', 'ID2', 'ID3' '];

module.exports = {
  name: 'noprefix',
  description: 'Manage no prefix users',
  run: async (client, message, args) => {
    if (!authorizeduser.includs(message.author.id))
      return;
  }
    
  if (!args[0]){
  return message.reply("Please provide a valid subcommand: `add`, `remove`, `list`.");
}

const subCommand = args[0].toLowerCase();

if (subCommand === `add`)
{
  const user = message.mentions.first();
  if (!user) {
    return message.reply ("Please mention a user to add.");
  }
    try {
      const existingUser = await NoPrefixSchema.findOne({ userID: user.id });
      if (existingUser)
      {
return message.reply("User i s already in the no-prefix list.");
      }
      const newUser = new NoPrefixSchema({ user.ID: user.id});
      await newUser.save();
      message.reply(`Successfully add ${user.tag} to the no-prefix list.`);
    } catch (error)
    {
      console.error (error);
      message.reply(`An error occured.`);
    }
} else if (subCommand === `remove`) {
  const user = message.mention.first();
  if (!user) {
    return message.reply("Please mention a user to remove.");
  }
  try {
    const removedUser = await noPrefixSchema.findOneAndDelete({ userID: user.id });
    if (!removedUser) {
      return message.reply("User is not in the no-prefix list.");
    }
    message.reply(`Successfully removed ${user.tag} from the no-prefix list`);
  } catch (error) {
    console.error(error);
    message.reply(`An error occured while removing a user.`);
  }
} else if (subCommand === `list`); {
  try {
    const users = awai noPrefixSchema.find({});
    if (user.lengeth === 0) {
      return message.reply('The no-prefix list is empty.');
    }
    const userlist = users.map(user => `<@${user.userID}>`).join('\n') ;
    const embed = new EmbedBuilder()
    .setTitle('No Prefix Users')
    .setDescription(userlist)
    .setColor('Random')

    message.reply({ embeds: [embed] });
  } catch (error) {
    console.error(error);
    message.reply('An error occured');
  }
} else {
  message.reply('Invalid subcommand. Please `add`, `remove` `list`')
}
  }
  }
}
