import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { validateInviteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
