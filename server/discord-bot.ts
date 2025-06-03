import { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, Collection } from 'discord.js';
import { pool } from './db';

let client: Client | null = null;

// Generate random invite code
function generateInviteCode(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = [];
  
  // Generate 3 segments of 4 characters each (e.g., ABCD-EFGH-1234)
  for (let i = 0; i < 3; i++) {
    let segment = '';
    for (let j = 0; j < 4; j++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    segments.push(segment);
  }
  
  return segments.join('-');
}

// Check if code exists in database
async function codeExists(code: string): Promise<boolean> {
  try {
    const result = await pool.query('SELECT code FROM invite_codes WHERE code = $1', [code]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database error checking code:', error);
    return false;
  }
}

// Insert invite code into database
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

// Generate unique code that doesn't exist in database
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

// Register slash commands
async function registerCommands(): Promise<void> {
  if (!client) return;
  
  const commands = [
    new SlashCommandBuilder()
      .setName('request-access')
      .setDescription('Request an invite code for MLVS District'),
    
    new SlashCommandBuilder()
      .setName('generate-bulk')
      .setDescription('Generate multiple invite codes (Admin only)')
      .addIntegerOption(option =>
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
    console.log('Started refreshing application (/) commands.');
    
    if (process.env.DISCORD_GUILD_ID) {
      // Register guild commands for faster testing
      const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
      if (guild) {
        await guild.commands.set(commands);
        console.log('Successfully reloaded guild application (/) commands.');
      }
    } else {
      // Register global commands
      await client.application?.commands.set(commands);
      console.log('Successfully reloaded global application (/) commands.');
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Check if user is admin
function isAdmin(member: any): boolean {
  return member.permissions.has('ADMINISTRATOR') || member.permissions.has('MANAGE_GUILD');
}

// Check if channel is verify channel
function isVerifyChannel(channel: any): boolean {
  return channel.name === 'verify' || channel.name === 'verification';
}

// Check if user has made a recent request (1 hour cooldown)
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

// Handle request access command
async function handleRequestAccess(interaction: any): Promise<void> {
  try {
    // Check if in verify channel
    if (!isVerifyChannel(interaction.channel)) {
      await interaction.reply({
        content: 'This command can only be used in the #verify channel.',
        ephemeral: true
      });
      return;
    }

    // Check cooldown
    if (await hasRecentRequest(interaction.user.id)) {
      await interaction.reply({
        content: 'You can only request access once per hour. Please wait before requesting again.',
        ephemeral: true
      });
      return;
    }

    // Generate unique code
    const code = await generateUniqueCode();
    await insertInviteCode(code);

    // Log request in database
    await pool.query(`
      INSERT INTO discord_requests (discord_user_id, invite_code, created_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (discord_user_id) DO UPDATE SET
        invite_code = $2,
        created_at = NOW()
    `, [interaction.user.id, code]);

    // Send code via DM
    try {
      const dmEmbed = new EmbedBuilder()
        .setTitle('🎉 MLVS District Access Code')
        .setDescription(`Your invite code: **${code}**`)
        .addFields(
          { name: 'How to use:', value: 'Visit the MLVS District website and enter this code to gain access.' },
          { name: 'Important:', value: 'This code is single-use only and expires when used.' }
        )
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.user.send({ embeds: [dmEmbed] });

      await interaction.reply({
        content: '✅ Your invite code has been sent to your DMs!',
        ephemeral: true
      });
    } catch (dmError) {
      await interaction.reply({
        content: `Your invite code: **${code}**\n\n⚠️ I couldn't send a DM, so here's your code. Please save it!`,
        ephemeral: true
      });
    }

  } catch (error) {
    console.error('Error handling request access:', error);
    await interaction.reply({
      content: 'An error occurred while processing your request. Please try again later.',
      ephemeral: true
    });
  }
}

// Handle bulk generation command
async function handleGenerateBulk(interaction: any): Promise<void> {
  if (!isAdmin(interaction.member)) {
    await interaction.reply({
      content: 'This command requires administrator permissions.',
      ephemeral: true
    });
    return;
  }

  const count = interaction.options.getInteger('count');
  
  try {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode();
      await insertInviteCode(code);
      codes.push(code);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Generated ${count} Invite Codes`)
      .setDescription(codes.map(code => `\`${code}\``).join('\n'))
      .setColor(0x0099ff)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error generating bulk codes:', error);
    await interaction.reply({
      content: 'An error occurred while generating codes.',
      ephemeral: true
    });
  }
}

// Handle code stats command
async function handleCodeStats(interaction: any): Promise<void> {
  if (!isAdmin(interaction.member)) {
    await interaction.reply({
      content: 'This command requires administrator permissions.',
      ephemeral: true
    });
    return;
  }

  try {
    const totalResult = await pool.query('SELECT COUNT(*) FROM invite_codes');
    const usedResult = await pool.query("SELECT COUNT(*) FROM invite_codes WHERE is_used = 'true'");
    const availableResult = await pool.query("SELECT COUNT(*) FROM invite_codes WHERE is_used = 'false'");

    const total = parseInt(totalResult.rows[0].count);
    const used = parseInt(usedResult.rows[0].count);
    const available = parseInt(availableResult.rows[0].count);

    const embed = new EmbedBuilder()
      .setTitle('📊 Invite Code Statistics')
      .addFields(
        { name: 'Total Codes', value: total.toString(), inline: true },
        { name: 'Used Codes', value: used.toString(), inline: true },
        { name: 'Available Codes', value: available.toString(), inline: true }
      )
      .setColor(0x0099ff)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  } catch (error) {
    console.error('Error getting code stats:', error);
    await interaction.reply({
      content: 'An error occurred while fetching statistics.',
      ephemeral: true
    });
  }
}

export async function startDiscordBot(): Promise<void> {
  // Check for required environment variables
  if (!process.env.DISCORD_BOT_TOKEN) {
    console.log('DISCORD_BOT_TOKEN not found - Discord bot will not start');
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.log('DATABASE_URL not found - Discord bot will not start');
    return;
  }

  try {
    // Create Discord requests table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        invite_code TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    client.once('ready', async () => {
      console.log(`✅ Discord bot logged in as ${client?.user?.tag}`);
      await registerCommands();
    });

    client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      switch (interaction.commandName) {
        case 'request-access':
          await handleRequestAccess(interaction);
          break;
        case 'generate-bulk':
          await handleGenerateBulk(interaction);
          break;
        case 'code-stats':
          await handleCodeStats(interaction);
          break;
      }
    });

    client.on('error', (error) => {
      console.error('Discord bot error:', error);
    });

    await client.login(process.env.DISCORD_BOT_TOKEN);
    console.log('🤖 Discord bot starting...');

  } catch (error) {
    console.error('Failed to start Discord bot:', error);
  }
}

export function getDiscordClient(): Client | null {
  return client;
}