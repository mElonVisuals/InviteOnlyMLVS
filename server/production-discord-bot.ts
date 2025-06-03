import { pool } from './db';

// Production Discord bot with automatic command registration
export class ProductionDiscordBot {
  private client: any = null;
  private isStarted = false;
  private commands: any[] = [];

  async start(): Promise<void> {
    if (this.isStarted) return;

    const token = process.env.DISCORD_BOT_TOKEN;
    const guildId = process.env.DISCORD_GUILD_ID;

    if (!token) {
      console.log('Discord bot: Token not provided, skipping bot startup');
      return;
    }

    try {
      // Dynamic import with fallback
      let Discord;
      try {
        Discord = await import('discord.js');
      } catch (importError) {
        Discord = require('discord.js');
      }
      
      const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, REST, Routes } = Discord;

      console.log('Starting Discord bot service...');

      // Create necessary tables
      await this.createTables();

      // Initialize client
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Define commands
      this.commands = [
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

      // Register commands immediately on ready
      this.client.once('ready', async () => {
        console.log(`Discord bot connected as ${this.client.user?.tag}`);
        await this.forceRegisterCommands(token, guildId);
        this.isStarted = true;
        console.log('Discord bot fully initialized with commands');
      });

      // Handle interactions
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
          try {
            await interaction.reply({
              content: 'An error occurred while processing your request.',
              ephemeral: true
            });
          } catch (replyError) {
            console.error('Failed to send error reply:', replyError);
          }
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
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS discord_requests (
          id SERIAL PRIMARY KEY,
          discord_user_id TEXT UNIQUE NOT NULL,
          invite_code TEXT NOT NULL,
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id SERIAL PRIMARY KEY,
          discord_user_id TEXT NOT NULL,
          discord_username TEXT NOT NULL,
          content TEXT NOT NULL,
          report_type TEXT NOT NULL,
          status TEXT DEFAULT 'open',
          created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (error) {
      console.error('Error creating Discord bot tables:', error);
    }
  }

  private async forceRegisterCommands(token: string, guildId?: string): Promise<void> {
    try {
      let Discord;
      try {
        Discord = await import('discord.js');
      } catch (importError) {
        Discord = require('discord.js');
      }
      
      const { REST, Routes } = Discord;
      const rest = new REST({ version: '10' }).setToken(token);

      console.log('Registering Discord slash commands...');

      const commandData = this.commands.map(command => command.toJSON());

      if (guildId) {
        // Register guild-specific commands (faster)
        await rest.put(
          Routes.applicationGuildCommands(this.client.user.id, guildId),
          { body: commandData }
        );
        console.log(`Successfully registered ${commandData.length} guild commands for guild ${guildId}`);
      } else {
        // Register global commands (slower but works everywhere)
        await rest.put(
          Routes.applicationCommands(this.client.user.id),
          { body: commandData }
        );
        console.log(`Successfully registered ${commandData.length} global commands`);
      }
    } catch (error) {
      console.error('Error registering commands:', error);
    }
  }

  private generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    result += '-';
    for (let i = 0; i < 4; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private async codeExists(code: string): Promise<boolean> {
    const result = await pool.query('SELECT 1 FROM invite_codes WHERE code = $1', [code]);
    return result.rows.length > 0;
  }

  private async insertInviteCode(code: string): Promise<boolean> {
    try {
      await pool.query('INSERT INTO invite_codes (code) VALUES ($1)', [code]);
      return true;
    } catch (error) {
      console.error('Error inserting invite code:', error);
      return false;
    }
  }

  private async generateUniqueCode(): Promise<string> {
    let code;
    let attempts = 0;
    do {
      code = this.generateInviteCode();
      attempts++;
      if (attempts > 100) {
        throw new Error('Failed to generate unique code after 100 attempts');
      }
    } while (await this.codeExists(code));
    return code;
  }

  private async hasRecentRequest(userId: string): Promise<boolean> {
    const result = await pool.query(
      'SELECT 1 FROM discord_requests WHERE discord_user_id = $1 AND created_at > NOW() - INTERVAL \'24 hours\'',
      [userId]
    );
    return result.rows.length > 0;
  }

  private isAdmin(member: any, PermissionFlagsBits: any): boolean {
    return member?.permissions?.has(PermissionFlagsBits.Administrator) || false;
  }

  private async handleRequestAccess(interaction: any, EmbedBuilder: any): Promise<void> {
    const userId = interaction.user.id;
    const username = interaction.user.username;

    if (await this.hasRecentRequest(userId)) {
      const embed = new EmbedBuilder()
        .setTitle('Request Limit Reached')
        .setDescription('You can only request access once per 24 hours.')
        .setColor(0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
      return;
    }

    try {
      const inviteCode = await this.generateUniqueCode();
      
      await pool.query(
        'INSERT INTO discord_requests (discord_user_id, invite_code) VALUES ($1, $2)',
        [userId, inviteCode]
      );

      await pool.query(
        'UPDATE invite_codes SET discord_user_id = $1, discord_username = $2 WHERE code = $3',
        [userId, username, inviteCode]
      );

      const embed = new EmbedBuilder()
        .setTitle('Access Code Generated')
        .setDescription(`Your invite code: \`${inviteCode}\`\n\nUse this code at [dev.melonvisuals.me](https://dev.melonvisuals.me) to access the system.`)
        .setColor(0x00ff00)
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error('Error generating invite code:', error);
      
      const errorEmbed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to generate invite code. Please try again later.')
        .setColor(0xff0000)
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
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

export const productionDiscordBot = new ProductionDiscordBot();