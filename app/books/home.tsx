import { routes } from "@/app/safe-routes";
import Grid from "@/components/grid";
import Poster from "@/components/poster";
import { db } from "@/server/db";
import type { Prisma } from "@prisma/client";
import Link from "next/link";

const BooksHome = async () => {
  const books = await db.book.findMany({
    orderBy: { createdAt: "desc" },
    include: { authors: true },
  });

  return (
    <div className="space-y-4 w-full max-w-screen-md">
      <div>
        <h2 className="font-semibold text-3xl mb-4">Mes livres</h2>
        {books.length > 0 ? (
          <Grid>
            {books.map((book) => (
              <BookPoster key={book.id} book={book} />
            ))}
          </Grid>
        ) : (
          <div className="italic">Pas de livre ajouté</div>
        )}
      </div>
    </div>
  );
};

export const BookPoster = ({
  book,
}: {
  book: Prisma.BookGetPayload<{ include: { authors: true } }>;
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
        imageAlt={`${book.title} poster`}
        imageUrl={book.cover}
        title={book.title ?? ""}
        subtitle={book.authors.map((author) => author.name).join(", ")}
      />
    </Link>
  );
};

export default BooksHome;
