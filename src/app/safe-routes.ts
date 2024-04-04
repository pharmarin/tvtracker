import { createNavigationConfig } from "next-safe-navigation";
import { z } from "zod";

export const { routes, useSafeParams, useSafeSearchParams } =
  createNavigationConfig((defineRoute) => ({
    home: defineRoute("/"),
    showAdd: defineRoute("/series/ajouter"),
    showSingle: defineRoute("/series/[showId]", {
      params: z.object({
        showId: z.coerce.number(),
      }),
    }),
  }));
