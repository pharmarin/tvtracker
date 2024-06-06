"use server";

import { routes } from "@/app/safe-routes";
import { createShow, updateShow } from "@/app/series/utils";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createShowAction = action(
  z.object({
    tmdbShowId: z.number(),
  }),
  async ({ tmdbShowId }) => {
    const id = await createShow(tmdbShowId);

    revalidatePath(routes.home());

    return id;
  },
);

export const updateShowAction = action(
  z.object({
    showId: z.string().cuid(),
  }),
  async ({ showId }) => {
    await updateShow(showId);

    revalidatePath(routes.home());
    revalidatePath(routes.showSingle({ showId }));
  },
);
