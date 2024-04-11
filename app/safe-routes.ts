import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const { routes, useSafeParams, useSafeSearchParams } =
  createNavigationConfig((defineRoute) => ({
    home: defineRoute("/"),
    showSingle: defineRoute("/series/[showId]", {
      params: z.object({
        showId: z.coerce.number(),
      }),
    }),
    movieSingle: defineRoute("/films/[movieId]", {
      params: z.object({
        movieId: z.coerce.number(),
      }),
    }),
    jobs: defineRoute("/api/jobs", {
      search: z.object({
        job: z.literal("REFRESH_SHOWS").optional(),
        skip: z.coerce.number().optional(),
      }),
    }),
  }));
