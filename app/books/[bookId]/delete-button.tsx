"use client";

import { deleteBook } from "@/app/books/[bookId]/actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";

const DeleteButton = ({
  bookTitle,
  bookId,
}: {
  bookTitle: string;
  bookId: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      className="space-x-2"
      onClick={async () => {
        if (confirm(`Supprimer ${bookTitle} ?`)) {
          setIsDeleting(true);
          await deleteBook({ bookId });
          setIsDeleting(false);
        }
      }}
      variant="destructive"
    >
      {isDeleting ? (
        <Loader2Icon className="animate-spin" />
      ) : (
        <>
          <Trash2Icon />
          <span>Supprimer</span>
        </>
      )}
    </Button>
  );
};

export default DeleteButton;
