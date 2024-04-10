import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const Grid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid grid-cols-3 sm:grid-cols-5 gap-4 max-w-3xl",
        className,
      )}
    >
      {children}
    </div>
  );
};

export default Grid;
