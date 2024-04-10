"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteMovie = action(
  z.object({ movieId: z.number() }),
  async ({ movieId }) => {
    await db.movie.delete({ where: { id: movieId } });

    revalidatePath(routes.home());

    redirect(routes.home());
  },
);

export const setCheckedMovie = action(
  z.object({ checked: z.boolean(), movieId: z.number() }),
  async ({ checked, movieId }) => {
    await db.movie.update({
      where: { id: movieId },
      data: { checked: !checked },
    });

    revalidatePath(routes.movieSingle({ movieId }));
    revalidatePath(routes.home());
  },
);
