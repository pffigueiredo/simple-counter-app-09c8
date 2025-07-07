
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { type UpdateCounterInput } from '../schema';
import { updateCounter } from '../handlers/update_counter';
import { eq } from 'drizzle-orm';

describe('updateCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create and increment counter when none exists', async () => {
    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should create and decrement counter when none exists', async () => {
    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(-1);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should increment existing counter', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 5,
        updated_at: new Date()
      })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(6);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should decrement existing counter', async () => {
    // Create initial counter
    await db.insert(countersTable)
      .values({
        value: 10,
        updated_at: new Date()
      })
      .execute();

    const input: UpdateCounterInput = {
      operation: 'decrement'
    };

    const result = await updateCounter(input);

    expect(result.value).toEqual(9);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save updated counter to database', async () => {
    // Create initial counter
    const initialCounter = await db.insert(countersTable)
      .values({
        value: 0,
        updated_at: new Date()
      })
      .returning()
      .execute();

    const input: UpdateCounterInput = {
      operation: 'increment'
    };

    const result = await updateCounter(input);

    // Verify in database
    const counters = await db.select()
      .from(countersTable)
      .where(eq(countersTable.id, result.id))
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].value).toEqual(1);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
    expect(counters[0].updated_at.getTime()).toBeGreaterThan(initialCounter[0].updated_at.getTime());
  });

  it('should handle multiple operations correctly', async () => {
    // Start with increment
    const incrementResult = await updateCounter({ operation: 'increment' });
    expect(incrementResult.value).toEqual(1);

    // Then decrement
    const decrementResult = await updateCounter({ operation: 'decrement' });
    expect(decrementResult.value).toEqual(0);

    // Then increment again
    const incrementResult2 = await updateCounter({ operation: 'increment' });
    expect(incrementResult2.value).toEqual(1);
  });
});
