import './src/app.js';
require("dotenv").config();

const {
    Client,
    GatewayIntentBits,
    PermissionsBitField,
    EmbedBuilder
} = require("discord.js");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// =============================
// CONFIG
// =============================

const PREFIX = ""; // TRUE NO PREFIX

const cooldowns = new Map();

const COOLDOWN = 2000;

// =============================
// READY
// =============================

client.once("ready", () => {
    console.log("=================================");
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`🌐 Servers: ${client.guilds.cache.size}`);
    console.log("🚀 Bot is online!");
    console.log("=================================");

    client.user.setActivity("help | No Prefix", {
        type: 0
    });
});

// =============================
// MESSAGE HANDLER
// =============================

client.on("messageCreate", async (message) => {

    // Ignore bots
    if (message.author.bot) return;

    // Ignore DMs
    if (!message.guild) return;

    // =============================
    // COOLDOWN
    // =============================

    const now = Date.now();

    if (cooldowns.has(message.author.id)) {

        const expiration = cooldowns.get(message.author.id);

        if (now < expiration) {
            return;
        }
    }

    cooldowns.set(
        message.author.id,
        now + COOLDOWN
    );

    // =============================
    // PARSE COMMAND
    // =============================

    const args = message.content.trim().split(/\s+/);

    const command = args.shift().toLowerCase();

    // =============================
    // HELP
    // =============================

    if (
        command === "help" ||
        command === "commands" ||
        command === "h"
    ) {

        const embed = new EmbedBuilder()
            .setTitle("📚 All Commands")
            .setDescription(
                "**🛡️ Moderation**\n" +
                "`kick @user`\n" +
                "`ban @user`\n" +
                "`unban userID`\n" +
                "`timeout @user 10m`\n" +
                "`untimeout @user`\n" +
                "`clear 10`\n" +
                "`lock`\n" +
                "`unlock`\n\n" +

                "**ℹ️ Information**\n" +
                "`ping`\n" +
                "`avatar`\n" +
                "`userinfo @user`\n" +
                "`serverinfo`\n\n" +

                "**🎮 Fun**\n" +
                "`8ball question`\n" +
                "`coinflip`\n" +
                "`dice`\n\n" +

                "**🔧 Utility**\n" +
                "`say message`\n" +
                "`role @user RoleName`"
            )
            .setFooter({
                text: "No prefix required"
            });

        return message.reply({
            embeds: [embed]
        });
    }

    // =============================
    // PING
    // =============================

    if (command === "ping") {

        return message.reply(
            `🏓 Pong!\nLatency: **${client.ws.ping}ms**`
        );
    }

    // =============================
    // AVATAR
    // =============================

    if (command === "avatar") {

        const user =
            message.mentions.users.first() ||
            message.author;

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Avatar`)
            .setImage(
                user.displayAvatarURL({
                    size: 1024
                })
            );

        return message.reply({
            embeds: [embed]
        });
    }

    // =============================
    // SERVER INFO
    // =============================

    if (command === "serverinfo") {

        const guild = message.guild;

        const embed = new EmbedBuilder()
            .setTitle("🛡️ Server Information")
            .addFields(
                {
                    name: "Server",
                    value: guild.name,
                    inline: true
                },
                {
                    name: "Members",
                    value: `${guild.memberCount}`,
                    inline: true
                },
                {
                    name: "Channels",
                    value: `${guild.channels.cache.size}`,
                    inline: true
                },
                {
                    name: "Owner",
                    value: `<@${guild.ownerId}>`,
                    inline: true
                }
            );

        return message.reply({
            embeds: [embed]
        });
    }

    // =============================
    // USER INFO
    // =============================

    if (command === "userinfo") {

        const user =
            message.mentions.users.first() ||
            message.author;

        const member =
            await message.guild.members
                .fetch(user.id)
                .catch(() => null);

        const embed = new EmbedBuilder()
            .setTitle("👤 User Information")
            .setThumbnail(
                user.displayAvatarURL()
            )
            .addFields(
                {
                    name: "Username",
                    value: user.username,
                    inline: true
                },
                {
                    name: "ID",
                    value: user.id,
                    inline: true
                },
                {
                    name: "Joined Server",
                    value: member
                        ? `<t:${Math.floor(
                            member.joinedTimestamp / 1000
                        )}:R>`
                        : "Unknown"
                }
            );

        return message.reply({
            embeds: [embed]
        });
    }

    // =============================
    // SAY
    // =============================

    if (command === "say") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            )
        ) {
            return message.reply(
                "❌ You need **Manage Messages** permission."
            );
        }

        const text = args.join(" ");

        if (!text) {
            return message.reply(
                "❌ Usage: `say hello everyone`"
            );
        }

        return message.channel.send(text);
    }

    // =============================
    // CLEAR
    // =============================

    if (command === "clear") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageMessages
            )
        ) {
            return message.reply(
                "❌ You need **Manage Messages** permission."
            );
        }

        const amount = parseInt(args[0]);

        if (
            isNaN(amount) ||
            amount < 1 ||
            amount > 100
        ) {
            return message.reply(
                "❌ Enter a number between 1 and 100."
            );
        }

        await message.channel.bulkDelete(
            amount,
            true
        );

        const msg = await message.channel.send(
            `🗑️ Deleted **${amount} messages**.`
        );

        setTimeout(() => {
            msg.delete().catch(() => {});
        }, 3000);

        return;
    }

    // =============================
    // KICK
    // =============================

    if (command === "kick") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.KickMembers
            )
        ) {
            return message.reply(
                "❌ You need **Kick Members** permission."
            );
        }

        const member =
            message.mentions.members.first();

        if (!member) {
            return message.reply(
                "❌ Mention a member."
            );
        }

        if (!member.kickable) {
            return message.reply(
                "❌ I cannot kick this member."
            );
        }

        await member.kick(
            `Kicked by ${message.author.tag}`
        );

        return message.reply(
            `👢 **${member.user.tag}** was kicked.`
        );
    }

    // =============================
    // BAN
    // =============================

    if (command === "ban") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.BanMembers
            )
        ) {
            return message.reply(
                "❌ You need **Ban Members** permission."
            );
        }

        const member =
            message.mentions.members.first();

        if (!member) {
            return message.reply(
                "❌ Mention a member."
            );
        }

        if (!member.bannable) {
            return message.reply(
                "❌ I cannot ban this member."
            );
        }

        await member.ban({
            reason: `Banned by ${message.author.tag}`
        });

        return message.reply(
            `🔨 **${member.user.tag}** was banned.`
        );
    }

    // =============================
    // UNBAN
    // =============================

    if (command === "unban") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.BanMembers
            )
        ) {
            return message.reply(
                "❌ You need **Ban Members** permission."
            );
        }

        const userId = args[0];

        if (!userId) {
            return message.reply(
                "❌ Usage: `unban USER_ID`"
            );
        }

        try {

            await message.guild.members.unban(
                userId
            );

            return message.reply(
                `🔓 User **${userId}** has been unbanned.`
            );

        } catch {

            return message.reply(
                "❌ Could not unban that user."
            );
        }
    }

    // =============================
    // TIMEOUT
    // =============================

    if (command === "timeout") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ModerateMembers
            )
        ) {
            return message.reply(
                "❌ You need **Moderate Members** permission."
            );
        }

        const member =
            message.mentions.members.first();

        const duration =
            args[1] || "10m";

        if (!member) {
            return message.reply(
                "❌ Mention a member."
            );
        }

        const match =
            duration.match(/^(\d+)(s|m|h|d)$/i);

        if (!match) {
            return message.reply(
                "❌ Use formats like `10m`, `1h`, or `1d`."
            );
        }

        const amount =
            parseInt(match[1]);

        const unit =
            match[2].toLowerCase();

        let milliseconds;

        if (unit === "s")
            milliseconds = amount * 1000;

        if (unit === "m")
            milliseconds = amount * 60 * 1000;

        if (unit === "h")
            milliseconds = amount * 60 * 60 * 1000;

        if (unit === "d")
            milliseconds = amount * 24 * 60 * 60 * 1000;

        if (milliseconds > 28 * 24 * 60 * 60 * 1000) {
            return message.reply(
                "❌ Discord timeout cannot exceed 28 days."
            );
        }

        if (!member.moderatable) {
            return message.reply(
                "❌ I cannot timeout this member."
            );
        }

        await member.timeout(
            milliseconds,
            `Timeout by ${message.author.tag}`
        );

        return message.reply(
            `🔇 **${member.user.tag}** was timed out for **${duration}**.`
        );
    }

    // =============================
    // UNTIMEOUT
    // =============================

    if (command === "untimeout") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ModerateMembers
            )
        ) {
            return message.reply(
                "❌ You need **Moderate Members** permission."
            );
        }

        const member =
            message.mentions.members.first();

        if (!member) {
            return message.reply(
                "❌ Mention a member."
            );
        }

        await member.timeout(null);

        return message.reply(
            `🔊 Timeout removed from **${member.user.tag}**.`
        );
    }

    // =============================
    // LOCK
    // =============================

    if (command === "lock") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageChannels
            )
        ) {
            return message.reply(
                "❌ You need **Manage Channels** permission."
            );
        }

        await message.channel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                SendMessages: false
            }
        );

        return message.reply(
            "🔒 Channel locked."
        );
    }

    // =============================
    // UNLOCK
    // =============================

    if (command === "unlock") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageChannels
            )
        ) {
            return message.reply(
                "❌ You need **Manage Channels** permission."
            );
        }

        await message.channel.permissionOverwrites.edit(
            message.guild.roles.everyone,
            {
                SendMessages: null
            }
        );

        return message.reply(
            "🔓 Channel unlocked."
        );
    }

    // =============================
    // ROLE
    // =============================

    if (command === "role") {

        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageRoles
            )
        ) {
            return message.reply(
                "❌ You need **Manage Roles** permission."
            );
        }

        const member =
            message.mentions.members.first();

        if (!member) {
            return message.reply(
                "❌ Mention a member."
            );
        }

        const roleName =
            args.slice(1).join(" ");

        if (!roleName) {
            return message.reply(
                "❌ Example: `role @user Member`"
            );
        }

        const role =
            message.guild.roles.cache.find(
                r =>
                    r.name.toLowerCase() ===
                    roleName.toLowerCase()
            );

        if (!role) {
            return message.reply(
                "❌ Role not found."
            );
        }

        if (role.position >= message.guild.members.me.roles.highest.position) {
            return message.reply(
                "❌ That role is higher than my highest role."
            );
        }

        await member.roles.add(role);

        return message.reply(
            `✅ Added **${role.name}** to **${member.user.tag}**.`
        );
    }

    // =============================
    // 8BALL
    // =============================

    if (command === "8ball") {

        const question =
            args.join(" ");

        if (!question) {
            return message.reply(
                "❓ Ask me a question."
            );
        }

        const answers = [
            "Yes.",
            "No.",
            "Definitely.",
            "Probably.",
            "Maybe.",
            "Ask again later.",
            "I don't think so.",
            "Absolutely!"
        ];

        const answer =
            answers[
                Math.floor(
                    Math.random() *
                    answers.length
                )
            ];

        return message.reply(
            `🎱 **${answer}**`
        );
    }

    // =============================
    // COINFLIP
    // =============================

    if (command === "coinflip") {

        const result =
            Math.random() < 0.5
                ? "Heads"
                : "Tails";

        return message.reply(
            `🪙 **${result}**`
        );
    }

    // =============================
    // DICE
    // =============================

    if (command === "dice") {

        const result =
            Math.floor(
                Math.random() * 6
            ) + 1;

        return message.reply(
            `🎲 You rolled **${result}**`
        );
    }
});

// =============================
// ERROR HANDLING
// =============================

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

// =============================
// LOGIN
// =============================

client.login(process.env.DISCORD_TOKEN);
