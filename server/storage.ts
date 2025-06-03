import { inviteCodes, sessions, type InviteCode, type InsertInviteCode, type InsertSession, type Session } from "@shared/schema";

export interface IStorage {
  getInviteCodeByCode(code: string): Promise<InviteCode | undefined>;
  markInviteCodeAsUsed(id: number): Promise<void>;
  createSession(session: InsertSession): Promise<Session>;
  initializeInviteCodes(): Promise<void>;
}

export class MemStorage implements IStorage {
  private inviteCodes: Map<number, InviteCode>;
  private sessions: Map<number, Session>;
  private currentInviteId: number;
  private currentSessionId: number;

  constructor() {
    this.inviteCodes = new Map();
    this.sessions = new Map();
    this.currentInviteId = 1;
    this.currentSessionId = 1;
    this.initializeInviteCodes();
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
      const inviteCode: InviteCode = {
        id: this.currentInviteId++,
        code,
        isUsed: "false",
        usedAt: null,
        createdAt: new Date(),
      };
      this.inviteCodes.set(inviteCode.id, inviteCode);
    }
  }

  async getInviteCodeByCode(code: string): Promise<InviteCode | undefined> {
    return Array.from(this.inviteCodes.values()).find(
      (invite) => invite.code.toUpperCase() === code.toUpperCase()
    );
  }

  async markInviteCodeAsUsed(id: number): Promise<void> {
    const inviteCode = this.inviteCodes.get(id);
    if (inviteCode) {
      inviteCode.isUsed = "true";
      inviteCode.usedAt = new Date();
      this.inviteCodes.set(id, inviteCode);
    }
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = {
      id,
      ...insertSession,
      accessTime: new Date(),
    };
    this.sessions.set(id, session);
    return session;
  }
}

export const storage = new MemStorage();
