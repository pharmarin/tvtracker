"use server";

import { googleBookToPrisma } from "@/app/books/utils";
import { routes } from "@/app/safe-routes";
import { db } from "@/server/db";
import { action } from "@/server/safe-action";
import { books } from "@googleapis/books";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

export const deleteBook = action(
  z.object({ bookId: z.string().cuid() }),
  async ({ bookId }) => {
    await db.book.delete({ where: { id: bookId } });

    revalidatePath(routes.home());
    redirect(routes.home());
  },
);

export const updateBook = action(
  z.object({ gapiId: z.string() }),
  async ({ gapiId }) => {
    const book = await books("v1").volumes.get({ volumeId: gapiId });
    const data = googleBookToPrisma(book.data);

    const { id } = await db.book.update({
      where: { gapiId },
      data,
    });

    revalidatePath(routes.bookSingle({ bookId: id }));
  },
);

export const setCheckedBookAction = action(
  z.object({
    checked: z.boolean(),
    bookId: z.string().cuid(),
    column: z.union([z.literal("checked_marin"), z.literal("checked_marion")]),
  }),
  async ({ checked, bookId, column }) => {
    await db.book.update({
      where: { id: bookId },
      data: { [column]: !checked },
    });

    revalidatePath(routes.bookSingle({ bookId }));
    revalidatePath(routes.home());
  },
);

export const setPlannedBookAction = action(
  z.object({
    checked: z.boolean(),
    bookId: z.string().cuid(),
    column: z.union([z.literal("planned_marin"), z.literal("planned_marion")]),
  }),
  async ({ checked, bookId, column }) => {
    await db.book.update({
      where: { id: bookId },
      data: { [column]: !checked },
    });

    revalidatePath(routes.bookSingle({ bookId }));
    revalidatePath(routes.home());
  },
);
