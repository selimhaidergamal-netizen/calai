import { eq, and, gte, lte, sql, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, foodEntries, fitnessGoals, aiAnalyses } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getFoodEntriesByDateRange(
  userId: number,
  startDate: string,
  endDate: string
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(foodEntries)
    .where(
      and(
        eq(foodEntries.userId, userId),
        gte(foodEntries.date, startDate),
        lte(foodEntries.date, endDate)
      )
    )
    .orderBy(foodEntries.date);
}

export async function getDailyCalorieSummary(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      totalCalories: sql<number>`SUM(${foodEntries.calories})`,
      entryCount: sql<number>`COUNT(*)`,
    })
    .from(foodEntries)
    .where(and(eq(foodEntries.userId, userId), eq(foodEntries.date, date)));

  return result[0] || { totalCalories: 0, entryCount: 0 };
}

export async function createFoodEntry(
  userId: number,
  data: {
    foodName: string;
    calories: number;
    mealType: "breakfast" | "lunch" | "dinner" | "snack";
    date: string;
    notes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(foodEntries).values({
    userId,
    ...data,
  });

  return result;
}

export async function deleteFoodEntry(userId: number, entryId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(foodEntries)
    .where(and(eq(foodEntries.userId, userId), eq(foodEntries.id, entryId)));
}

export async function getFitnessGoal(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(fitnessGoals)
    .where(eq(fitnessGoals.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function createOrUpdateFitnessGoal(
  userId: number,
  data: {
    targetWeight: number;
    bodyType: string;
    timelineMonths: number;
    personalNotes?: string;
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getFitnessGoal(userId);

  if (existing) {
    return db
      .update(fitnessGoals)
      .set(data)
      .where(eq(fitnessGoals.userId, userId));
  } else {
    return db.insert(fitnessGoals).values({
      userId,
      ...data,
    });
  }
}

export async function getLatestAIAnalysis(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(aiAnalyses)
    .where(eq(aiAnalyses.userId, userId))
    .orderBy(desc(aiAnalyses.createdAt))
    .limit(1);

  return result[0] || null;
}

export async function createAIAnalysis(
  userId: number,
  analysis: string,
  recommendations?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.insert(aiAnalyses).values({
    userId,
    analysis,
    recommendations,
  });
}
