import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  isUsed: text("is_used").notNull().default("false"),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  inviteCodeId: serial("invite_code_id").notNull(),
  accessTime: timestamp("access_time").defaultNow().notNull(),
  userAgent: text("user_agent"),
});

export const insertInviteCodeSchema = createInsertSchema(inviteCodes).pick({
  code: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  inviteCodeId: true,
  userAgent: true,
});

export const validateInviteSchema = z.object({
  code: z.string().min(1, "Invite code is required").max(16, "Invite code too long"),
});

export type InsertInviteCode = z.infer<typeof insertInviteCodeSchema>;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type ValidateInvite = z.infer<typeof validateInviteSchema>;
