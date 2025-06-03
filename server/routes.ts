import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateInviteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment platforms
  app.get("/health", (req, res) => {
    res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
  });

  // Request Discord invite
  app.post("/api/request-invite", async (req, res) => {
    try {
      // Discord bot integration - requires DISCORD_BOT_TOKEN and DISCORD_GUILD_ID
      const botToken = process.env.DISCORD_BOT_TOKEN;
      const guildId = process.env.DISCORD_GUILD_ID;
      
      if (!botToken || !guildId) {
        return res.status(500).json({ 
          success: false, 
          message: "Discord bot configuration missing. Please contact administrator." 
        });
      }

      // Create Discord invite using bot
      const discordResponse = await fetch(`https://discord.com/api/v10/guilds/${guildId}/invites`, {
        method: 'POST',
        headers: {
          'Authorization': `Bot ${botToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_age: 3600, // 1 hour expiry
          max_uses: 1,    // Single use
          temporary: false,
          unique: true
        })
      });

      if (!discordResponse.ok) {
        const error = await discordResponse.text();
        console.error('Discord API error:', error);
        return res.status(500).json({ 
          success: false, 
          message: "Failed to generate Discord invite. Please try again later." 
        });
      }

      const inviteData = await discordResponse.json();
      
      res.json({ 
        success: true,
        invite: `https://discord.gg/${inviteData.code}`,
        message: "Discord invite generated successfully!"
      });
    } catch (error) {
      console.error('Request invite error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error. Please try again later." 
      });
    }
  });

  // Validate invite code
  app.post("/api/validate-invite", async (req, res) => {
    try {
      const { code } = validateInviteSchema.parse(req.body);

      const inviteCode = await storage.getInviteCodeByCode(code);
      
      if (!inviteCode) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid invite code. Please check and try again." 
        });
      }

      if (inviteCode.isUsed === "true") {
        return res.status(400).json({ 
          success: false, 
          message: "This invite code has already been used." 
        });
      }

      // Mark as used and create session
      await storage.markInviteCodeAsUsed(inviteCode.id);
      const session = await storage.createSession({
        inviteCodeId: inviteCode.id,
        userAgent: req.headers['user-agent'] || null,
      });

      res.json({ 
        success: true, 
        message: "Invite code verified successfully!",
        session: {
          id: session.id,
          accessTime: session.accessTime,
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false, 
          message: error.errors[0]?.message || "Invalid input" 
        });
      }
      
      console.error("Error validating invite:", error);
      res.status(500).json({ 
        success: false, 
        message: "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
