import { updateBook } from "@/app/books/[bookId]/actions";
import DeleteButton from "@/app/books/[bookId]/delete-button";
import { routes } from "@/app/safe-routes";
import LoadingButton from "@/components/loading-button";
import { db } from "@/server/db";
import { RefreshCcwIcon } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import sanitize from "sanitize-html";

const page = async ({ params }: { params: unknown }) => {
  try {
    const { bookId } = routes.bookSingle.$parseParams(params);
    const book = await db.book.findFirstOrThrow({
      where: { id: bookId },
      include: { authors: true, categories: true },
    });

    const updateBookWithId = updateBook.bind(null, { gapiId: book.gapiId });

    return (
      <div className="max-w-3xl w-full space-y-4">
        <div className="flex flex-row space-x-4">
          {book.cover && (
            <Image
              alt={`${book.title} cover`}
              className="rounded-lg w-48 h-fit max-w-[33%] shrink-0"
              src={book.cover}
              height={500}
              width={500}
            />
          )}
          <div>
            <h2 className="text-3xl font-bold">{book.title}</h2>
            <h3 className="text-xl italic mb-4">
              {book.authors.map((author) => author.name).join(", ")}
            </h3>
            {book.categories.length > 1 && (
              <p>
                Catégorie(s) :{" "}
                {book.categories.map((category) => category.name).join(", ")}
              </p>
            )}
            {book.publishedDate && (
              <p>
                Date de publication :{" "}
                {book.publishedDate.toLocaleDateString(["fr"])}
              </p>
            )}
            <div
              className="my-4 italic text-opacity-50"
              dangerouslySetInnerHTML={{
                __html: sanitize(book.description ?? ""),
              }}
            ></div>
            <div className="flex mt-4 flex-col gap-2 md:flex-row">
              <form action={updateBookWithId}>
                <LoadingButton className="w-full space-x-2">
                  <RefreshCcwIcon /> <span>Mettre à jour</span>
                </LoadingButton>
              </form>
              <DeleteButton bookId={book.id} bookTitle={book.title ?? ""} />
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.log("error: ", error);
    notFound();
  }
};

export default page;
