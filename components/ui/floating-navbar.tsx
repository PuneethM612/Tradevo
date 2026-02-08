
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "../../lib/utils";
// Fix: Explicitly ensuring Link is imported from react-router-dom
import { Link } from "react-router-dom";
import { HoverBorderGradient } from "./hover-border-gradient";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: React.ReactNode;
  }[];
  className?: string;
}) => {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    if (typeof current === "number") {
      let previous = scrollYProgress.getPrevious() ?? 0;
      let direction = current - previous;

      if (current < 0.05) {
        setVisible(false);
      } else {
        if (direction < 0) {
          setVisible(true);
        } else {
          setVisible(false);
        }
      }
    }
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: -100,
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto border border-white/[0.1] rounded-full bg-black/60 backdrop-blur-lg shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] pr-2 pl-8 py-2 items-center justify-center space-x-4",
          className
        )}
      >
        {navItems.map((navItem, idx: number) => (
          <a
            key={`link-${idx}`}
            href={navItem.link}
            className={cn(
              "relative text-neutral-400 items-center flex space-x-1 hover:text-[#00ff9c] transition-colors"
            )}
          >
            <span className="block sm:hidden">{navItem.icon}</span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-[0.2em]">{navItem.name}</span>
          </a>
        ))}
        
        <HoverBorderGradient
          as={Link}
          to="/login"
          containerClassName="rounded-full"
          className="bg-black text-white px-6 py-2 rounded-full text-[10px] uppercase font-bold tracking-[0.2em]"
        >
          Login
        </HoverBorderGradient>
      </motion.div>
    </AnimatePresence>
  );
};
