"use client";

import { deleteMovie } from "@/app/films/[movieId]/actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";

const DeleteButton = ({
  movieName,
  movieId,
}: {
  movieName: string;
  movieId: number;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      className="space-x-2"
      onClick={async () => {
        if (confirm(`Supprimer ${movieName} ?`)) {
          setIsDeleting(true);
          await deleteMovie({ movieId });
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
