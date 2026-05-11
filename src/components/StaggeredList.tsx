"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StaggeredListProps {
  children: React.ReactNode[];
  className?: string;
  delay?: number;
}

export default function StaggeredList({ children, className, delay = 50 }: StaggeredListProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {children.map((child, i) => (
        <div
          key={i}
          className="animate-stagger-in opacity-0"
          style={{ 
            animationDelay: `${i * delay}ms`,
            animationFillMode: 'forwards'
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
