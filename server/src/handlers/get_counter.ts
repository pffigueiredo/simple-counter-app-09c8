
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type Counter } from '../schema';

export async function getCounter(): Promise<Counter> {
  try {
    // Try to get the first counter from the database
    const result = await db.select()
      .from(countersTable)
      .limit(1)
      .execute();

    // If no counter exists, create one with initial value 0
    if (result.length === 0) {
      const newCounter = await db.insert(countersTable)
        .values({
          value: 0
        })
        .returning()
        .execute();

      return newCounter[0];
    }

    // Return the existing counter
    return result[0];
  } catch (error) {
    console.error('Get counter failed:', error);
    throw error;
  }
}
