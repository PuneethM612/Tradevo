
"use client";
import React, { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { cn } from "../../lib/utils";

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export const EncryptedText = ({
  text,
  className,
  revealedClassName,
  encryptedClassName,
  revealDelayMs = 50,
}: {
  text: string;
  className?: string;
  revealedClassName?: string;
  encryptedClassName?: string;
  revealDelayMs?: number;
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isRevealed, setIsRevealed] = useState(false);
  const containerRef = useRef(null);
  const isInView = useInView(containerRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView && !isRevealed) {
      let iteration = 0;
      const interval = setInterval(() => {
        setDisplayText((prev) =>
          text
            .split("")
            .map((char, index) => {
              if (index < iteration) {
                return text[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("")
        );

        if (iteration >= text.length) {
          clearInterval(interval);
          setIsRevealed(true);
        }

        iteration += 1 / 3;
      }, revealDelayMs);

      return () => clearInterval(interval);
    }
  }, [isInView, text, isRevealed, revealDelayMs]);

  return (
    <span
      ref={containerRef}
      className={cn("inline-block font-mono", className, isRevealed ? revealedClassName : encryptedClassName)}
    >
      {displayText}
    </span>
  );
};
