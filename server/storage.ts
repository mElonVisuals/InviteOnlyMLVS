import { inviteCodes, sessions, type InviteCode, type InsertInviteCode, type InsertSession, type Session } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getInviteCodeByCode(code: string): Promise<InviteCode | undefined>;
  markInviteCodeAsUsed(id: number): Promise<void>;
  createSession(session: InsertSession): Promise<Session>;
  initializeInviteCodes(): Promise<void>;
  getSessionsWithDiscordData(): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getInviteCodeByCode(code: string): Promise<InviteCode | undefined> {
    const [inviteCode] = await db.select().from(inviteCodes).where(eq(inviteCodes.code, code.toUpperCase()));
    return inviteCode || undefined;
  }

  async markInviteCodeAsUsed(id: number): Promise<void> {
    await db
      .update(inviteCodes)
      .set({ 
        isUsed: "true", 
        usedAt: new Date() 
      })
      .where(eq(inviteCodes.id, id));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db
      .insert(sessions)
      .values(insertSession)
      .returning();
    return session;
  }

  async initializeInviteCodes(): Promise<void> {
    const defaultCodes = [
      'ALPHA-2024',
      'BETA-ACCESS',
      'EARLY-BIRD',
      'VIP-MEMBER',
      'DEMO-CODE'
    ];

    for (const code of defaultCodes) {
      // Check if code already exists
      const existing = await this.getInviteCodeByCode(code);
      if (!existing) {
        await db.insert(inviteCodes).values({ code });
      }
    }
  }

  async getSessionsWithDiscordData(): Promise<any[]> {
    const result = await db
      .select({
        sessionId: sessions.id,
        accessTime: sessions.accessTime,
        userAgent: sessions.userAgent,
        inviteCode: inviteCodes.code,
        discordUsername: inviteCodes.discordUsername,
        discordUserId: inviteCodes.discordUserId,
        usedAt: inviteCodes.usedAt,
      })
      .from(sessions)
      .innerJoin(inviteCodes, eq(sessions.inviteCodeId, inviteCodes.id))
      .orderBy(sessions.accessTime);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
