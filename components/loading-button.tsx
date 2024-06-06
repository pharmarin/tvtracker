"use client";

import type { ButtonProps } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Loader2Icon } from "lucide-react";
import { useFormStatus } from "react-dom";

const LoadingButton = ({ children, ...props }: ButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <Button
      onClick={(event) => pending && event.preventDefault()}
      disabled={pending}
      type="submit"
      {...props}
    >
      {pending ? <Loader2Icon className="animate-spin" /> : children}
    </Button>
  );
};

export default LoadingButton;
