"use server";

import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteMovieAction = action(
  z.object({ movieId: z.string().cuid() }),
  async ({ movieId }) => {
    await db.movie.delete({ where: { id: movieId } });

    revalidatePath(routes.home());
    redirect(routes.home());
  },
);

export const setCheckedMovieAction = action(
  z.object({ checked: z.boolean(), movieId: z.string().cuid() }),
  async ({ checked, movieId }) => {
    await db.movie.update({
      where: { id: movieId },
      data: { checked: !checked },
    });

    revalidatePath(routes.movieSingle({ movieId }));
    revalidatePath(routes.home());
  },
);
