"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const setCheckedEpisode = action(
  z.object({
    checked: z.boolean(),
    episodeId: z.string().cuid(),
    showId: z.string().cuid(),
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
              season: {
                number: { lt: episodeInfos.season?.number ?? 0 },
                showId,
              },
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
    revalidatePath(routes.home());
  },
);

export const deleteShow = action(
  z.object({ showId: z.string().cuid() }),
  async ({ showId }) => {
    await db.show.delete({ where: { id: showId } });

    revalidatePath(routes.home());
    redirect(routes.home());
  },
);

export const setDropShow = action(
  z.object({ showId: z.string().cuid(), dropped: z.boolean() }),
  async ({ dropped, showId }) => {
    await db.show.update({
      where: { id: showId },
      data: { dropped: !dropped },
    });

    revalidatePath(routes.home());
    redirect(routes.home());
  },
);
