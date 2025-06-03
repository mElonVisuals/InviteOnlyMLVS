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
      .setName('generate-code')
      .setDescription('Generate a new invite code for MLVS District')
      .addStringOption(option =>
        option.setName('type')
          .setDescription('Type of invite code')
          .setRequired(false)
          .addChoices(
            { name: 'Standard', value: 'standard' },
            { name: 'VIP', value: 'vip' },
            { name: 'Staff', value: 'staff' }
          )
      ),
    
    new SlashCommandBuilder()
      .setName('generate-bulk')
      .setDescription('Generate multiple invite codes')
      .addIntegerOption(option =>
        option.setName('count')
          .setDescription('Number of codes to generate (1-50)')
          .setRequired(true)
          .setMinValue(1)
          .setMaxValue(50)
      ),
      
    new SlashCommandBuilder()
      .setName('code-stats')
      .setDescription('Show invite code statistics'),
  ];

  try {
    await client.application.commands.set(commands);
    console.log('Slash commands registered successfully');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

// Handle slash command interactions
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    if (commandName === 'generate-code') {
      await handleGenerateCode(interaction);
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

// Handle generate-code command
async function handleGenerateCode(interaction) {
  await interaction.deferReply();
  
  const type = interaction.options.getString('type') || 'standard';
  
  try {
    const code = await generateUniqueCode();
    await insertInviteCode(code);
    
    const embed = new EmbedBuilder()
      .setColor(0x00FF00)
      .setTitle('🎫 New Invite Code Generated')
      .setDescription(`**Code:** \`${code}\``)
      .addFields(
        { name: 'Type', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true },
        { name: 'Status', value: 'Unused', inline: true },
        { name: 'Created', value: new Date().toLocaleString(), inline: true }
      )
      .setFooter({ text: 'MLVS District Access Control' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
    
  } catch (error) {
    const errorEmbed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('❌ Generation Failed')
      .setDescription('Failed to generate invite code. Please try again.')
      .setTimestamp();

    await interaction.editReply({ embeds: [errorEmbed] });
  }
}

// Handle generate-bulk command
async function handleGenerateBulk(interaction) {
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

// Handle code-stats command
async function handleCodeStats(interaction) {
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