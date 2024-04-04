"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const setCheckedEpisode = action(
  z.object({
    checked: z.boolean(),
    episodeId: z.number(),
    showId: z.number(),
    checkPrevious: z.boolean(),
  }),
  async ({ checked, episodeId, showId, checkPrevious }) => {
    if (checkPrevious) {
      const episodeInfos = await db.episode.findFirstOrThrow({
        where: { id: episodeId },
        select: {
          season: { select: { id: true, number: true } },
          number: true,
        },
      });

      await db.episode.updateMany({
        where: {
          OR: [
            {
              seasonId: episodeInfos.season?.id,
              number: { lte: episodeInfos.number ?? 0 },
            },
            {
              season: { number: { lt: episodeInfos.season?.number ?? 0 } },
            },
          ],
        },
        data: { checked: { set: !checked } },
      });
    } else {
      await db.episode.update({
        where: { id: episodeId },
        data: { checked: { set: !checked } },
      });
    }

    revalidatePath(routes.showSingle({ showId }));
  },
);
