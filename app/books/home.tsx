import { routes } from "@/app/safe-routes";
import { CURRENT_USER_COOKIE, getCurrentUser } from "@/app/utils";
import Grid from "@/components/grid";
import Poster from "@/components/poster";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import Link from "next/link";

const BooksHome = async () => {
  const currentUserCookie = cookies().get(CURRENT_USER_COOKIE);
  const currentUser = getCurrentUser(currentUserCookie?.value);

  const readBooksByAuthor = await db.bookAuthor.findMany({
    orderBy: { name: "asc" },
    include: {
      books: {
        where: {
          [currentUser.checkedColumn]: true,
        },
        include: { authors: true },
      },
    },
  });
  const toReadBooks = await db.book.findMany({
    where: {
      [currentUser.plannedColumn]: true,
      [currentUser.checkedColumn]: false,
    },
    orderBy: { createdAt: "desc" },
    include: { authors: true },
  });

  return (
    <div className="space-y-4 w-full max-w-screen-md">
      <div>
        <h2 className="font-semibold text-3xl mb-4">Livres non lus</h2>
        {toReadBooks.length > 0 ? (
          <Grid>
            {toReadBooks.map((book) => (
              <BookPoster key={book.id} book={book} />
            ))}
          </Grid>
        ) : (
          <div className="italic">Pas de livre ajouté</div>
        )}
      </div>
      {readBooksByAuthor.length > 0 && (
        <div>
          <h2 className="font-semibold text-3xl mb-4">Livres lus</h2>
          {readBooksByAuthor.map(
            (author) =>
              author.books.length > 0 && (
                <div key={author.id} className="mb-4">
                  <h3 className="italic text-xl mb-2">{author.name}</h3>
                  <Grid>
                    {author.books.map((book) => (
                      <BookPoster key={book.id} book={book} checked={true} />
                    ))}
                  </Grid>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  );
};

export const BookPoster = ({
  book,
  checked,
}: {
  book: Prisma.BookGetPayload<{ include: { authors: true } }>;
  checked?: boolean;
}) => {
  return (
    <Link
      key={book.id}
      className="flex justify-top flex-col"
      href={routes.bookSingle({
        bookId: book.id,
      })}
    >
      <Poster
        checked={checked}
        imageAlt={`${book.title} poster`}
        imageUrl={book.cover}
        title={book.title ?? ""}
        subtitle={book.authors.map((author) => author.name).join(", ")}
      />
    </Link>
  );
};

export default BooksHome;
