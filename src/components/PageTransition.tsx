"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

const TAB_ORDER = ["/", "/templates", "/movements", "/history", "/settings"];

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");

  useEffect(() => {
    if (pathname !== prevPathname) {
      const prevIndex = TAB_ORDER.indexOf(prevPathname);
      const currentIndex = TAB_ORDER.indexOf(pathname);

      if (prevIndex !== -1 && currentIndex !== -1) {
        setDirection(currentIndex > prevIndex ? "right" : "left");
      } else {
        setDirection("none");
      }
      setPrevPathname(pathname);
    }
  }, [pathname, prevPathname]);

  const animationClass = direction === "right" 
    ? "animate-slide-in-right" 
    : direction === "left" 
    ? "animate-slide-in-left" 
    : "animate-fade-in";

  return (
    <div key={pathname} className={animationClass}>
      {children}
    </div>
  );
}
