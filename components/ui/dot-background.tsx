
import { cn } from "../../lib/utils";
import React from "react";

export const DotBackground = ({ 
  children, 
  className,
  dotColor = "#404040" 
}: { 
  children?: React.ReactNode; 
  className?: string;
  dotColor?: string;
}) => {
  return (
    <div className={cn("relative flex w-full items-center justify-center bg-black", className)}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: "20px 20px",
          backgroundImage: `radial-gradient(${dotColor} 1px, transparent 1px)`,
        }}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="relative z-20 w-full h-full">
        {children}
      </div>
    </div>
  );
};
