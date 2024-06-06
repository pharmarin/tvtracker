"use server";

import { createBook } from "@/app/books/utils";
import { routes } from "@/app/safe-routes";
import { action } from "@/server/safe-action";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export const createBookAction = action(
  z.object({
    bookId: z.string(),
  }),
  async ({ bookId }) => {
    const book = await createBook(bookId);

    revalidatePath(routes.home());

    return book.id;
  },
);
