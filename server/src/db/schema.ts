
import { serial, integer, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const countersTable = pgTable('counters', {
  id: serial('id').primaryKey(),
  value: integer('value').notNull().default(0),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Counter = typeof countersTable.$inferSelect; // For SELECT operations
export type NewCounter = typeof countersTable.$inferInsert; // For INSERT operations

// Important: Export all tables for proper query building
export const tables = { counters: countersTable };
