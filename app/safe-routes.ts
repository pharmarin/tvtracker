import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const { routes, useSafeParams, useSafeSearchParams } =
  createNavigationConfig((defineRoute) => ({
    home: defineRoute("/"),
    showSingle: defineRoute("/series/[showId]", {
      params: z.object({
        showId: z.string().cuid(),
      }),
    }),
    movieSingle: defineRoute("/films/[movieId]", {
      params: z.object({
        movieId: z.string().cuid(),
      }),
    }),
    bookSingle: defineRoute("/books/[bookId]", {
      params: z.object({ bookId: z.string().cuid() }),
    }),
    jobs: defineRoute("/api/jobs", {
      search: z.object({
        job: z.literal("REFRESH_SHOWS").optional(),
        skip: z.coerce.number().optional(),
      }),
    }),
  }));
