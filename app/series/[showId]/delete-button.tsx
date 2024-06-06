"use client";

import { deleteShow } from "@/app/series/[showId]/actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon, Trash2Icon } from "lucide-react";
import { useState } from "react";

const DeleteButton = ({
  showName,
  showId,
}: {
  showName: string;
  showId: string;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      className="space-x-2"
      onClick={async () => {
        if (confirm(`Supprimer ${showName} ?`)) {
          setIsDeleting(true);
          await deleteShow({ showId });
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
