"use client";

import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

const LoadingButton = ({ children }: { children: ReactNode }) => {
  const { pending } = useFormStatus();

  if (pending) {
    return;
  }

  return (
    <Button
      onClick={(event) => pending && event.preventDefault()}
      type="submit"
    >
      {pending ? <Loader2Icon className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
};

export default LoadingButton;
