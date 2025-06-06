const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Discord bot client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Generate random invite code
function generateInviteCode() {
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

// Check if code already exists in database
async function codeExists(code) {
  try {
    const result = await pool.query('SELECT id FROM invite_codes WHERE code = $1', [code]);
    return result.rows.length > 0;
  } catch (error) {
    console.error('Database check error:', error);
    return false;
  }
}

// Insert new invite code into database
async function insertInviteCode(code) {
  try {
    const result = await pool.query(
      'INSERT INTO invite_codes (code, is_used, created_at) VALUES ($1, $2, $3) RETURNING id',
      [code, 'false', new Date()]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Database insert error:', error);
    throw error;
  }
}

// Generate unique invite code
async function generateUniqueCode() {
  let code;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    code = generateInviteCode();
    attempts++;
    
    if (attempts >= maxAttempts) {
      throw new Error('Failed to generate unique code after multiple attempts');
    }
  } while (await codeExists(code));
  
  return code;
}

// Bot ready event
client.once('ready', () => {
  console.log(`Discord bot logged in as ${client.user.tag}`);
  registerCommands();
});

// Register slash commands
async function registerCommands() {
  const commands = [
    new SlashCommandBuilder()
      .setName('request-access')
      .setDescription('Request an invite code for MLVS District access'),
    
    new SlashCommandBuilder()
      .setName('generate-bulk')
      .setDescription('Generate multiple invite codes (Admin only)')
      .addIntegerOption(option =>
        option.setName('count')
          .setDescription('Number of codes to generate (1-50)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(50)
      ),
      
    new SlashCommandBuilder()
      .setName('code-stats')
      .setDescription('Show invite code statistics (Admin only)'),
  ];

  try {
    await client.application.commands.set(commands);
    console.log('Slash commands registered successfully');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Configuration
const VERIFY_CHANNEL_NAME = 'verify'; // Channel name where users can request codes
const ADMIN_ROLE_NAME = 'Admin'; // Role name for admin commands

// Check if user is admin
function isAdmin(member) {
  return member.roles.cache.some(role => role.name === ADMIN_ROLE_NAME);
}

// Check if command is used in verify channel
function isVerifyChannel(channel) {
  return channel.name === VERIFY_CHANNEL_NAME;
}

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'request-access') {
      await handleRequestAccess(interaction);
    } else if (commandName === 'generate-bulk') {
      await handleGenerateBulk(interaction);
    } else if (commandName === 'code-stats') {
      await handleCodeStats(interaction);
    }
  } catch (error) {
    console.error('Command error:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Error')
      .setDescription('An error occurred while processing your command.')
      .setTimestamp();

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ embeds: [errorEmbed], ephemeral: true });
    } else {
      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
});

// Check if user has already requested a code recently
async function hasRecentRequest(userId) {
  try {
    const result = await pool.query(
      'SELECT created_at FROM invite_codes WHERE user_id = $1 AND created_at >= NOW() - INTERVAL \'1 hour\' ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('Recent request check error:', error);
    return false;
  }
}

// Handle request-access command
async function handleRequestAccess(interaction) {
  // Check if command is used in verify channel
  if (!isVerifyChannel(interaction.channel)) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Wrong Channel')
      .setDescription(`This command can only be used in the #${VERIFY_CHANNEL_NAME} channel.`)
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });
  
  const userId = interaction.user.id;
  const username = interaction.user.username;
  
  try {
    // Check if user has requested recently
    const hasRecent = await hasRecentRequest(userId);
    if (hasRecent) {
      const errorEmbed = new EmbedBuilder()
        .setColor(0xFF6600)
        .setTitle('⏰ Cooldown Active')
        .setDescription('You can only request one invite code per hour. Please wait before requesting again.')
        .setTimestamp();

      await interaction.editReply({ embeds: [errorEmbed] });
      return;
    }

    // Generate unique code
    const code = await generateUniqueCode();
    
    // Insert code with user ID
    await pool.query(
      'INSERT INTO invite_codes (code, is_used, created_at, user_id) VALUES ($1, $2, $3, $4)',
      [code, 'false', new Date(), userId]
    );
    
    // Send code privately to user
    const privateEmbed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎫 Your MLVS District Access Code')
      .setDescription(`**Your exclusive invite code:** \`${code}\``)
      .addFields(
        { name: 'How to use:', value: 'Visit the MLVS District website and enter this code to gain access.', inline: false },
        { name: 'Valid until:', value: 'This code never expires but can only be used once.', inline: false },
        { name: 'Important:', value: 'Keep this code private. Do not share it with others.', inline: false }
      )
      .setFooter({ text: 'MLVS District Access Control' })
      .setTimestamp();

    // Send private message to user
    try {
      await interaction.user.send({ embeds: [privateEmbed] });
      
      // Confirm in channel (ephemeral)
      const confirmEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('✅ Code Sent')
        .setDescription('Your invite code has been sent to your direct messages. Check your DMs!')
        .setTimestamp();

      await interaction.editReply({ embeds: [confirmEmbed] });
      
    } catch (dmError) {
      // If DM fails, send code ephemerally in channel
      console.error('DM failed, sending ephemeral message:', dmError);
      
      const fallbackEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('🎫 Your MLVS District Access Code')
        .setDescription(`**Your exclusive invite code:** \`${code}\``)
        .addFields(
          { name: 'How to use:', value: 'Visit the MLVS District website and enter this code to gain access.', inline: false },
          { name: 'Important:', value: 'This message is only visible to you. Keep your code private.', inline: false }
        )
        .setFooter({ text: 'MLVS District Access Control' })
        .setTimestamp();

      await interaction.editReply({ embeds: [fallbackEmbed] });
    }
    
    // Log the request
    console.log(`Access code ${code} generated for user ${username} (${userId})`);
    
  } catch (error) {
    console.error('Request access error:', error);
    
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Generation Failed')
      .setDescription('Failed to generate invite code. Please try again later.')
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Handle generate-bulk command (Admin only)
async function handleGenerateBulk(interaction) {
  // Check if user is admin
  if (!isAdmin(interaction.member)) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Permission Denied')
      .setDescription('This command is only available to administrators.')
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  await interaction.deferReply();
  
  const count = interaction.options.getInteger('count');
  const generatedCodes = [];
  
  try {
    for (let i = 0; i < count; i++) {
      const code = await generateUniqueCode();
      await insertInviteCode(code);
      generatedCodes.push(code);
    }
    
    const codeList = generatedCodes.map(code => `\`${code}\``).join('\n');
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle(`🎫 Generated ${count} Invite Codes`)
      .setDescription(codeList.length > 4000 ? 
        `Generated ${count} codes successfully. Use /code-stats to view details.` : 
        codeList
      )
      .setFooter({ text: 'MLVS District Access Control' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Bulk Generation Failed')
      .setDescription(`Failed to generate codes. Generated ${generatedCodes.length}/${count} before error.`)
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Handle code-stats command (Admin only)
async function handleCodeStats(interaction) {
  // Check if user is admin
  if (!isAdmin(interaction.member)) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Permission Denied')
      .setDescription('This command is only available to administrators.')
      .setTimestamp();

    await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    return;
  }

  await interaction.deferReply();
  
  try {
    const totalResult = await pool.query('SELECT COUNT(*) as total FROM invite_codes');
    const usedResult = await pool.query('SELECT COUNT(*) as used FROM invite_codes WHERE is_used = $1', ['true']);
    const recentResult = await pool.query(
      'SELECT COUNT(*) as recent FROM invite_codes WHERE created_at >= NOW() - INTERVAL \'24 hours\''
    );
    
    const total = parseInt(totalResult.rows[0].total);
    const used = parseInt(usedResult.rows[0].used);
    const recent = parseInt(recentResult.rows[0].recent);
    const unused = total - used;
    
    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle('📊 Invite Code Statistics')
      .addFields(
        { name: 'Total Codes', value: total.toString(), inline: true },
        { name: 'Used Codes', value: used.toString(), inline: true },
        { name: 'Available Codes', value: unused.toString(), inline: true },
        { name: 'Generated Today', value: recent.toString(), inline: true },
        { name: 'Usage Rate', value: `${total > 0 ? Math.round((used / total) * 100) : 0}%`, inline: true },
        { name: 'Last Updated', value: new Date().toLocaleString(), inline: true }
      )
      .setFooter({ text: 'MLVS District Access Control' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Stats Error')
      .setDescription('Failed to retrieve statistics from database.')
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Error handling
client.on('error', (error) => {
  console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled promise rejection:', error);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);