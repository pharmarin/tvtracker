import type { ReactNode } from "react";

const Grid = ({ children }: { children: ReactNode }) => {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 max-w-3xl">
      {children}
    </div>
  );
};

export default Grid;
