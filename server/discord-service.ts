import { pool } from './db';

// Simple Discord bot service for production deployment
export class DiscordBotService {
  private client: any = null;
  private isStarted = false;

  async start(): Promise<void> {
    if (this.isStarted) return;

    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!token) {
      console.log('Discord bot: Token not provided, skipping bot startup');
      return;
    }

    try {
      // Try dynamic import first, then fall back to require for production
      let Discord;
      try {
        Discord = await import('discord.js');
      } catch (importError) {
        console.log('ESM import failed, trying CommonJS require...');
        Discord = require('discord.js');
      }
      
      const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = Discord;

      console.log('Starting Discord bot service...');

      // Create bot tables
      await this.createTables();

      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      this.client.once('ready', async () => {
        console.log(`Discord bot connected as ${this.client.user?.tag}`);
        await this.registerCommands(SlashCommandBuilder, guildId);
        this.isStarted = true;
      });

      this.client.on('interactionCreate', async (interaction: any) => {
        if (!interaction.isChatInputCommand()) return;

        try {
          switch (interaction.commandName) {
            case 'request-access':
              await this.handleRequestAccess(interaction, EmbedBuilder);
              break;
            case 'generate-bulk':
              await this.handleGenerateBulk(interaction, EmbedBuilder, PermissionFlagsBits);
              break;
            case 'code-stats':
              await this.handleCodeStats(interaction, EmbedBuilder, PermissionFlagsBits);
              break;
            case 'report':
              await this.handleReport(interaction, EmbedBuilder);
              break;
          }
        } catch (error) {
          console.error('Command error:', error);
          await interaction.reply({
            content: 'An error occurred while processing your request.',
            ephemeral: true
          });
        }
      });

      this.client.on('error', (error: Error) => {
        console.error('Discord bot error:', error);
      });

      await this.client.login(token);

    } catch (error) {
      console.error('Failed to start Discord bot:', error);
    }
  }

  private async createTables(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS discord_requests (
        id SERIAL PRIMARY KEY,
        discord_user_id TEXT UNIQUE NOT NULL,
        invite_code TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private async registerCommands(SlashCommandBuilder: any, guildId?: string): Promise<void> {
    if (!this.client) return;

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
        .setDescription('View invite code statistics (Admin only)'),
      
      new SlashCommandBuilder()
        .setName('report')
        .setDescription('Submit a report to the admin team')
        .addStringOption((option: any) =>
          option.setName('type')
            .setDescription('Type of report')
            .setRequired(true)
            .addChoices(
              { name: 'Bug Report', value: 'bug' },
              { name: 'User Report', value: 'user' },
              { name: 'General Issue', value: 'general' },
              { name: 'Suggestion', value: 'suggestion' }
            ))
        .addStringOption((option: any) =>
          option.setName('content')
            .setDescription('Details of your report')
            .setRequired(true)
            .setMaxLength(1000))
    ];

    try {
      if (guildId) {
        const guild = this.client.guilds.cache.get(guildId);
        if (guild) {
          await guild.commands.set(commands);
          console.log('Discord commands registered for guild');
        }
      } else {
        await this.client.application?.commands.set(commands);
        console.log('Discord commands registered globally');
      }
    } catch (error) {
      console.error('Error registering Discord commands:', error);
    }
  }

  private generateInviteCode(): string {
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

  private async codeExists(code: string): Promise<boolean> {
    try {
      const result = await pool.query('SELECT code FROM invite_codes WHERE code = $1', [code]);
      return result.rows.length > 0;
    } catch (error) {
      console.error('Database error checking code:', error);
      return false;
    }
  }

  private async insertInviteCode(code: string): Promise<boolean> {
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

  private async generateUniqueCode(): Promise<string> {
    let code: string;
    let attempts = 0;
    const maxAttempts = 100;
    
    do {
      code = this.generateInviteCode();
      attempts++;
      
      if (attempts >= maxAttempts) {
        throw new Error('Unable to generate unique code after maximum attempts');
      }
    } while (await this.codeExists(code));
    
    return code;
  }

  private isVerifyChannel(channel: any): boolean {
    return channel.name === 'verify' || channel.name === 'verification';
  }

  private async hasRecentRequest(userId: string): Promise<boolean> {
    // Allow unlimited requests for admin user
    if (userId === '952705075711729695') {
      return false;
    }
    
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

  private isAdmin(member: any, PermissionFlagsBits: any): boolean {
    return member.permissions.has(PermissionFlagsBits.Administrator) || 
           member.permissions.has(PermissionFlagsBits.ManageGuild);
  }

  private async handleRequestAccess(interaction: any, EmbedBuilder: any): Promise<void> {
    if (!this.isVerifyChannel(interaction.channel)) {
      await interaction.reply({
        content: 'This command can only be used in the #verify channel.',
        ephemeral: true
      });
      return;
    }

    if (await this.hasRecentRequest(interaction.user.id)) {
      await interaction.reply({
        content: 'You can only request access once per hour. Please wait before requesting again.',
        ephemeral: true
      });
      return;
    }

    const code = await this.generateUniqueCode();
    await this.insertInviteCode(code);

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

  private async handleGenerateBulk(interaction: any, EmbedBuilder: any, PermissionFlagsBits: any): Promise<void> {
    if (!this.isAdmin(interaction.member, PermissionFlagsBits)) {
      await interaction.reply({
        content: 'This command requires administrator permissions.',
        ephemeral: true
      });
      return;
    }

    const count = interaction.options.getInteger('count');
    
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = await this.generateUniqueCode();
      await this.insertInviteCode(code);
      codes.push(code);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Generated ${count} Invite Codes`)
      .setDescription(codes.map((code: string) => `\`${code}\``).join('\n'))
      .setColor(0x0099ff)
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private async handleCodeStats(interaction: any, EmbedBuilder: any, PermissionFlagsBits: any): Promise<void> {
    if (!this.isAdmin(interaction.member, PermissionFlagsBits)) {
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

  private async handleReport(interaction: any, EmbedBuilder: any): Promise<void> {
    const reportType = interaction.options.getString('type');
    const content = interaction.options.getString('content');
    const userId = interaction.user.id;
    const username = interaction.user.username;

    try {
      // Insert report into database
      await pool.query(
        'INSERT INTO reports (discord_user_id, discord_username, content, report_type, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, username, content, reportType]
      );

      const typeLabels: { [key: string]: string } = {
        'bug': 'Bug Report',
        'user': 'User Report', 
        'general': 'General Issue',
        'suggestion': 'Suggestion'
      };

      const embed = new EmbedBuilder()
        .setTitle('Report Submitted Successfully')
        .setDescription(`Your ${typeLabels[reportType]} has been submitted to the admin team.`)
        .addFields(
          { name: 'Report Type', value: typeLabels[reportType], inline: true },
          { name: 'Submitted By', value: username, inline: true }
        )
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error submitting report:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('Report Submission Failed')
        .setDescription('There was an error submitting your report. Please try again later.')
        .setColor(0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
    }
  }
}

export const discordBot = new DiscordBotService();