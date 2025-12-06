import { motion, type HTMLMotionProps } from "framer-motion";
import clsx from "clsx";
import type React from "react";

interface IconButtonProps extends HTMLMotionProps<"button"> {
  size?: "sm" | "md";
}

export const IconButton: React.FC<IconButtonProps> = ({
  size = "md",
  className,
  children,
  ...props
}) => {
  const sizeClasses =
    size === "sm" ? "p-1.5 text-[0.8rem]" : "p-2 text-[1rem]";

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      className={clsx(
        "rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition text-slate-700 dark:text-slate-200",
        sizeClasses,
        className,
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
};

