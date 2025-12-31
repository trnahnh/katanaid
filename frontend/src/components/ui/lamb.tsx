"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-[10vh] flex-col items-center justify-center w-full rounded-md z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center z-0">
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-5 w-20 bg-linear-to-r from-transparent via-blue-500 to-transparent blur-sm"
        ></motion.div>
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-px w-60 md:w-120 bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.8)]"
        ></motion.div>
      </div>
      <div className="relative z-50 flex flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
