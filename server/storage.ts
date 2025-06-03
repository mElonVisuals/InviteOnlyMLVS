import { inviteCodes, sessions, type InviteCode, type InsertInviteCode, type InsertSession, type Session } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getInviteCodeByCode(code: string): Promise<InviteCode | undefined>;
  markInviteCodeAsUsed(id: number): Promise<void>;
  createSession(session: InsertSession): Promise<Session>;
  initializeInviteCodes(): Promise<void>;
  getSessionsWithDiscordData(): Promise<any[]>;
  getReports(): Promise<any[]>;
  addReport(userId: string, username: string, content: string, type: string): Promise<void>;
  updateUserProfile(sessionId: number, email: string, discordConnected: boolean): Promise<void>;
  getUserByDiscord(discordUserId: string): Promise<any | undefined>;
  createPersistentUser(discordUserId: string, discordUsername: string): Promise<void>;
  getUsersWithMemberRole(): Promise<any[]>;
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

  async getReports(): Promise<any[]> {
    const result = await db.execute(`
      SELECT 
        id,
        discord_user_id as "discordUserId",
        discord_username as "discordUsername",
        content,
        report_type as "reportType",
        created_at as "createdAt",
        status
      FROM reports
      ORDER BY created_at DESC
    `);
    
    return result.rows;
  }

  async addReport(userId: string, username: string, content: string, type: string): Promise<void> {
    const result = await db.execute(`
      INSERT INTO reports (discord_user_id, discord_username, content, report_type, status, created_at)
      VALUES ('${userId}', '${username}', '${content}', '${type}', 'pending', NOW())
    `);
  }

  async updateUserProfile(sessionId: number, email: string, discordConnected: boolean): Promise<void> {
    const result = await db.execute(`
      UPDATE sessions 
      SET email = '${email}', discord_connected = ${discordConnected}
      WHERE id = ${sessionId}
    `);
  }

  async getUserByDiscord(discordUserId: string): Promise<any | undefined> {
    const result = await db.execute(`
      SELECT * FROM invite_codes 
      WHERE discord_user_id = '${discordUserId}' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    return result.rows[0];
  }

  async createPersistentUser(discordUserId: string, discordUsername: string): Promise<void> {
    await db.execute(`
      INSERT INTO persistent_users (discord_user_id, discord_username, created_at, last_login)
      VALUES ('${discordUserId}', '${discordUsername}', NOW(), NOW())
      ON CONFLICT (discord_user_id) DO UPDATE SET
        discord_username = '${discordUsername}',
        last_login = NOW()
    `);
  }

  async getUsersWithMemberRole(): Promise<any[]> {
    // This will be enhanced with actual Discord API integration
    // For now, return users who have Discord usernames
    const result = await db.execute(`
      SELECT DISTINCT
        s.id as "sessionId",
        s.access_time as "accessTime",
        s.user_agent as "userAgent",
        ic.code as "inviteCode", 
        ic.discord_user_id as "discordUserId",
        ic.discord_username as "discordUsername",
        ic.used_at as "usedAt"
      FROM sessions s
      JOIN invite_codes ic ON s.invite_code_id = ic.id
      WHERE ic.discord_username IS NOT NULL
      AND ic.discord_username != 'Guest User'
      ORDER BY s.access_time DESC
    `);
    return result.rows;
  }
}

export const storage = new DatabaseStorage();
