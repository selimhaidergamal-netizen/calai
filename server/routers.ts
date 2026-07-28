import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createFoodEntry,
  deleteFoodEntry,
  getDailyCalorieSummary,
  getFoodEntriesByDateRange,
  getFitnessGoal,
  createOrUpdateFitnessGoal,
  getLatestAIAnalysis,
  createAIAnalysis,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  food: router({
    create: protectedProcedure
      .input(
        z.object({
          foodName: z.string().min(1),
          calories: z.number().int().positive(),
          mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
          date: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createFoodEntry(ctx.user.id, input);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number().int() }))
      .mutation(async ({ ctx, input }) => {
        return deleteFoodEntry(ctx.user.id, input.id);
      }),

    getDailyLog: protectedProcedure
      .input(z.object({ date: z.string() }))
      .query(async ({ ctx, input }) => {
        const entries = await getFoodEntriesByDateRange(
          ctx.user.id,
          input.date,
          input.date
        );
        const summary = await getDailyCalorieSummary(ctx.user.id, input.date);
        return { entries, summary };
      }),

    getHistory: protectedProcedure
      .input(
        z.object({
          startDate: z.string(),
          endDate: z.string(),
        })
      )
      .query(async ({ ctx, input }) => {
        return getFoodEntriesByDateRange(
          ctx.user.id,
          input.startDate,
          input.endDate
        );
      }),
  }),

  goal: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return getFitnessGoal(ctx.user.id);
    }),

    createOrUpdate: protectedProcedure
      .input(
        z.object({
          targetWeight: z.number().int().positive(),
          bodyType: z.string().min(1),
          timelineMonths: z.number().int().positive(),
          personalNotes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return createOrUpdateFitnessGoal(ctx.user.id, input);
      }),
  }),

  ai: router({
    generateInsights: protectedProcedure
      .input(
        z.object({
          daysBack: z.number().int().default(7),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Get date range
          const endDate = new Date();
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() - input.daysBack);

          const formatDate = (d: Date) =>
            d.toISOString().split("T")[0];

          // Fetch user data
          const entries = await getFoodEntriesByDateRange(
            ctx.user.id,
            formatDate(startDate),
            formatDate(endDate)
          );
          const goal = await getFitnessGoal(ctx.user.id);

          // Prepare prompt for Gemini
          const prompt = `You are a health and fitness coach. Analyze the following user data and provide personalized insights and recommendations.

User's Fitness Goal:
${goal ? `Target Weight: ${goal.targetWeight} lbs/kg, Body Type: ${goal.bodyType}, Timeline: ${goal.timelineMonths} months, Notes: ${goal.personalNotes}` : "No goal set yet"}

Recent Food Entries (Last ${input.daysBack} days):
${entries.map((e) => `- ${e.date}: ${e.foodName} (${e.calories} cal, ${e.mealType})`).join("\n") || "No entries"}

Provide:
1. Analysis of their current eating patterns
2. Progress toward their goal (if set)
3. Specific, actionable recommendations
4. Motivational insights

Keep the response concise and practical.`;

          // Call Gemini API
          const response = await invokeLLM({
            model: "gemini-3-flash-preview",
            messages: [
              {
                role: "user" as const,
                content: prompt,
              },
            ],
          });

          const analysisContent = response.choices[0]?.message.content;
          const analysis = typeof analysisContent === "string" ? analysisContent : "Unable to generate analysis";

          // Save analysis
          if (analysis) {
            await createAIAnalysis(ctx.user.id, analysis);
          }

          return { analysis };
        } catch (error) {
          console.error("[AI Analysis] Error generating insights:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to generate AI insights. Please try again later.",
          });
        }
      }),

    getLatest: protectedProcedure.query(async ({ ctx }) => {
      return getLatestAIAnalysis(ctx.user.id);
    }),
  }),
});

export type AppRouter = typeof appRouter;
