import { pool } from './db';

let discordClient: any = null;
let isInitialized = false;

export async function initializeDiscordBot(): Promise<void> {
  if (isInitialized) return;

  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token) {
    console.log('Discord bot: No token provided, skipping initialization');
    return;
  }

  console.log('Discord bot: Starting initialization...');

  try {
    // Ensure discord requests table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        invite_code TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Import Discord.js with fallback error handling
    let Discord;
    try {
      Discord = await import('discord.js');
    } catch (importError) {
      console.error('Discord bot: Failed to import discord.js:', importError);
      throw new Error('Discord.js package not available');
    }
    
    const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = Discord;

    discordClient = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    discordClient.once('ready', async () => {
      console.log(`Discord bot: Connected as ${discordClient.user?.tag}`);
      
      // Register commands
      const commands = [
        new SlashCommandBuilder()
          .setName('request-access')
          .setDescription('Request an invite code for MLVS District'),
        
        new SlashCommandBuilder()
          .setName('generate-bulk')
          .setDescription('Generate multiple invite codes (Admin only)')
          .addIntegerOption((option: any) =>
            option.setName('count')
              .setDescription('Number of codes to generate')
              .setRequired(true)
              .setMinValue(1)
              .setMaxValue(50)),
        
        new SlashCommandBuilder()
          .setName('code-stats')
          .setDescription('View invite code statistics (Admin only)')
      ];

      try {
        if (guildId) {
          const guild = discordClient.guilds.cache.get(guildId);
          if (guild) {
            await guild.commands.set(commands);
            console.log('Discord bot: Commands registered for guild');
          }
        } else {
          await discordClient.application?.commands.set(commands);
          console.log('Discord bot: Commands registered globally');
        }
      } catch (error) {
        console.error('Discord bot: Command registration failed:', error);
      }

      isInitialized = true;
    });

    discordClient.on('interactionCreate', async (interaction: any) => {
      if (!interaction.isChatInputCommand()) return;

      try {
        switch (interaction.commandName) {
          case 'request-access':
            await handleRequestAccess(interaction, EmbedBuilder);
            break;
          case 'generate-bulk':
            await handleGenerateBulk(interaction, EmbedBuilder, PermissionFlagsBits);
            break;
          case 'code-stats':
            await handleCodeStats(interaction, EmbedBuilder, PermissionFlagsBits);
            break;
        }
      } catch (error) {
        console.error('Discord bot: Command error:', error);
        if (!interaction.replied) {
          await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true
          });
        }
      }
    });

    discordClient.on('error', (error: Error) => {
      console.error('Discord bot: Runtime error:', error);
    });

    await discordClient.login(token);
    console.log('Discord bot: Login attempt completed');

  } catch (error) {
    console.error('Discord bot: Initialization failed:', error);
  }
}

function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

async function codeExists(code: string): Promise<boolean> {
  try {
    const result = await pool.query('SELECT code FROM invite_codes WHERE code = $1', [code]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database error checking code:', error);
    return false;
  }
}

async function insertInviteCode(code: string): Promise<boolean> {
  try {
    await pool.query(
      'INSERT INTO invite_codes (code, is_used) VALUES ($1, $2)',
      [code, 'false']
    );
    return true;
  } catch (error) {
    console.error('Database error inserting code:', error);
    return false;
  }
}

async function generateUniqueCode(): Promise<string> {
  let code: string;
  let attempts = 0;
  const maxAttempts = 100;
  
  do {
    code = generateInviteCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique code after maximum attempts');
    }
  } while (await codeExists(code));
  
  return code;
}

function isVerifyChannel(channel: any): boolean {
  return channel.name === 'verify' || channel.name === 'verification';
}

async function hasRecentRequest(userId: string): Promise<boolean> {
  try {
    const result = await pool.query(`
      SELECT discord_user_id 
      FROM discord_requests 
      WHERE discord_user_id = $1 
      AND created_at > NOW() - INTERVAL '1 hour'
    `, [userId]);
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database error checking recent requests:', error);
    return false;
  }
}

function isAdmin(member: any, PermissionFlagsBits: any): boolean {
  return member.permissions.has(PermissionFlagsBits.Administrator) || 
         member.permissions.has(PermissionFlagsBits.ManageGuild);
}

async function handleRequestAccess(interaction: any, EmbedBuilder: any): Promise<void> {
  if (!isVerifyChannel(interaction.channel)) {
    await interaction.reply({
      content: 'This command can only be used in the #verify channel.',
      ephemeral: true
    });
    return;
  }

  if (await hasRecentRequest(interaction.user.id)) {
    await interaction.reply({
      content: 'You can only request access once per hour. Please wait before requesting again.',
      ephemeral: true
    });
    return;
  }

  const code = await generateUniqueCode();
  await insertInviteCode(code);

  await pool.query(`
    INSERT INTO discord_requests (discord_user_id, invite_code, created_at)
    VALUES ($1, $2, NOW())
    ON CONFLICT (discord_user_id) DO UPDATE SET
      invite_code = $2,
      created_at = NOW()
  `, [interaction.user.id, code]);

  try {
    const dmEmbed = new EmbedBuilder()
      .setTitle('MLVS District Access Code')
      .setDescription(`Your invite code: **${code}**`)
      .addFields(
        { name: 'How to use:', value: 'Visit the MLVS District website and enter this code to gain access.' },
        { name: 'Important:', value: 'This code is single-use only and expires when used.' }
      )
      .setColor(0x00ff00)
      .setTimestamp();

    await interaction.user.send({ embeds: [dmEmbed] });
    await interaction.reply({
      content: 'Your invite code has been sent to your DMs!',
      ephemeral: true
    });
  } catch (dmError) {
    await interaction.reply({
      content: `Your invite code: **${code}**\n\nI couldn't send a DM, so here's your code. Please save it!`,
      ephemeral: true
    });
  }
}

async function handleGenerateBulk(interaction: any, EmbedBuilder: any, PermissionFlagsBits: any): Promise<void> {
  if (!isAdmin(interaction.member, PermissionFlagsBits)) {
    await interaction.reply({
      content: 'This command requires administrator permissions.',
      ephemeral: true
    });
    return;
  }

  const count = interaction.options.getInteger('count');
  
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = await generateUniqueCode();
    await insertInviteCode(code);
    codes.push(code);
  }

  const embed = new EmbedBuilder()
    .setTitle(`Generated ${count} Invite Codes`)
    .setDescription(codes.map((code: string) => `\`${code}\``).join('\n'))
    .setColor(0x0099ff)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

async function handleCodeStats(interaction: any, EmbedBuilder: any, PermissionFlagsBits: any): Promise<void> {
  if (!isAdmin(interaction.member, PermissionFlagsBits)) {
    await interaction.reply({
      content: 'This command requires administrator permissions.',
      ephemeral: true
    });
    return;
  }

  const totalResult = await pool.query('SELECT COUNT(*) FROM invite_codes');
  const usedResult = await pool.query("SELECT COUNT(*) FROM invite_codes WHERE is_used = 'true'");
  const availableResult = await pool.query("SELECT COUNT(*) FROM invite_codes WHERE is_used = 'false'");

  const total = parseInt(totalResult.rows[0].count);
  const used = parseInt(usedResult.rows[0].count);
  const available = parseInt(availableResult.rows[0].count);

  const embed = new EmbedBuilder()
    .setTitle('Invite Code Statistics')
    .addFields(
      { name: 'Total Codes', value: total.toString(), inline: true },
      { name: 'Used Codes', value: used.toString(), inline: true },
      { name: 'Available Codes', value: available.toString(), inline: true }
    )
    .setColor(0x0099ff)
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}