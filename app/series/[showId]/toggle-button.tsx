"use client";

import { setCheckedEpisode } from "app/series/[showId]/actions";
import { Button } from "components/ui/button";
import { CheckCircle2Icon, CircleIcon, Loader2Icon } from "lucide-react";
import { useState } from "react";

const ToggleButton = ({
  episodeId,
  checked,
  previousUnchecked,
  showId,
}: {
  episodeId: number;
  checked: boolean;
  previousUnchecked: boolean;
  showId: number;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <Button
      className="hover:bg-transparent hover:text-white"
      onClick={async () => {
        setIsLoading(true);

        await setCheckedEpisode({
          checked,
          episodeId,
          showId,
          checkPrevious:
            previousUnchecked &&
            confirm("Voulez-vous valider les épisodes précédents ?"),
        });

        setIsLoading(false);
      }}
      variant="ghost"
    >
      {isLoading ? (
        <Loader2Icon className="animate-spin" />
      ) : checked ? (
        <CheckCircle2Icon />
      ) : (
        <CircleIcon />
      )}
    </Button>
  );
};

export default ToggleButton;
