"use client";

import { deleteShow } from "@/app/series/[showId]/actions";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";

const DeleteButton = ({
  showName,
  showId,
}: {
  showName: string;
  showId: number;
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Button
      onClick={async () => {
        if (confirm(`Supprimer ${showName} ?`)) {
          setIsDeleting(true);
          await deleteShow({ showId });
          setIsDeleting(false);
        }
      }}
      variant="destructive"
    >
      {isDeleting ? <Loader2Icon className="animate-spin" /> : "Supprimer"}
    </Button>
  );
};

export default DeleteButton;
