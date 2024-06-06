import { CURRENT_USER_COOKIE, getCurrentUser } from "@/app/utils";
import { db } from "@/server/db";
import type { books_v1 } from "@googleapis/books";
import { books } from "@googleapis/books";
import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";

export const googleBookToPrisma = (
  book: books_v1.Schema$Volume,
): Omit<Prisma.BookCreateInput, "id"> => {
  if (!book.id) {
    throw new Error("Le livre retourné par Google ne contient pas d'ID");
  }

  return {
    gapiId: book.id,
    title: book.volumeInfo?.title,
    cover: book.volumeInfo?.imageLinks?.large,
    description: book.volumeInfo?.description,
    publishedDate: book.volumeInfo?.publishedDate
      ? new Date(book.volumeInfo.publishedDate)
      : undefined,
    authors: {
      connectOrCreate: (book.volumeInfo?.authors ?? []).map((author) => ({
        where: {
          name: author,
        },
        create: { name: author },
      })),
    },
    categories: {
      connectOrCreate: (book.volumeInfo?.categories ?? []).map((category) => ({
        where: { name: category },
        create: { name: category },
      })),
    },
  };
};

export const createBook = async (bookId: string) => {
  const book = await books("v1").volumes.get({ volumeId: bookId });
  const data = googleBookToPrisma(book.data);

  const currentUserCookie = cookies().get(CURRENT_USER_COOKIE);
  const currentUser = getCurrentUser(currentUserCookie?.value);

  return await db.book.create({
    data: {
      ...data,
      [currentUser.plannedColumn]: true,
    },
  });
};
