
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput, type Counter } from '../schema';
import { eq, sql } from 'drizzle-orm';

export async function updateCounter(input: UpdateCounterInput): Promise<Counter> {
  try {
    // First, ensure a counter exists (create if none exists)
    const existingCounters = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    if (existingCounters.length === 0) {
      // Create initial counter
      const initialValue = input.operation === 'increment' ? 1 : -1;
      const result = await db.insert(countersTable)
        .values({
          value: initialValue,
          updated_at: new Date()
        })
        .returning()
        .execute();

      return result[0];
    }

    // Update existing counter
    const counterId = existingCounters[0].id;
    const updateValue = input.operation === 'increment' ? 1 : -1;

    const result = await db.update(countersTable)
      .set({
        value: sql`${countersTable.value} + ${updateValue}`,
        updated_at: new Date()
      })
      .where(eq(countersTable.id, counterId))
      .returning()
      .execute();

    return result[0];
  } catch (error) {
    console.error('Counter update failed:', error);
    throw error;
  }
}
