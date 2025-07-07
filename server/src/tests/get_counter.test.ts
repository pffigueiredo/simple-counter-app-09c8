
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { countersTable } from '../db/schema';
import { getCounter } from '../handlers/get_counter';

describe('getCounter', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a counter with initial value 0 when none exists', async () => {
    const result = await getCounter();

    expect(result.id).toBeDefined();
    expect(result.value).toEqual(0);
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should save the new counter to database', async () => {
    const result = await getCounter();

    // Verify the counter was saved in the database
    const counters = await db.select()
      .from(countersTable)
      .execute();

    expect(counters).toHaveLength(1);
    expect(counters[0].id).toEqual(result.id);
    expect(counters[0].value).toEqual(0);
    expect(counters[0].updated_at).toBeInstanceOf(Date);
  });

  it('should return existing counter when one already exists', async () => {
    // Create a counter first
    await db.insert(countersTable)
      .values({
        value: 42
      })
      .execute();

    const result = await getCounter();

    expect(result.value).toEqual(42);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);
  });

  it('should return the first counter when multiple exist', async () => {
    // Create multiple counters
    await db.insert(countersTable)
      .values([
        { value: 10 },
        { value: 20 },
        { value: 30 }
      ])
      .execute();

    const result = await getCounter();

    expect(result.value).toEqual(10);
    expect(result.id).toBeDefined();
    expect(result.updated_at).toBeInstanceOf(Date);

    // Verify only the first counter was returned
    const allCounters = await db.select()
      .from(countersTable)
      .execute();

    expect(allCounters).toHaveLength(3);
  });
});
