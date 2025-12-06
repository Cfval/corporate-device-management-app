import { motion } from "framer-motion";
import clsx from "clsx";
import { useEffect, useRef } from "react";
import type { InputHTMLAttributes } from "react";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  indeterminate?: boolean;
}

export const Checkbox = ({
  className,
  label,
  indeterminate,
  ...props
}: CheckboxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const checked = Boolean(props.checked);
  const isIndeterminate = Boolean(indeterminate) && !checked;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  return (
    <label className="inline-flex cursor-pointer items-center gap-2">
      <motion.span
        whileTap={{ scale: 0.9 }}
        className={clsx(
          "relative flex h-5 w-5 items-center justify-center rounded-md border transition-colors",
          "border-slate-400 dark:border-slate-600",
          (checked || isIndeterminate) &&
            "border-sky-600 bg-sky-600 dark:border-sky-500 dark:bg-sky-500",
          className,
        )}
      >
        <input
          {...props}
          ref={inputRef}
          type="checkbox"
          className="peer sr-only"
        />
        {checked && (
          <svg
            className="absolute h-3 w-3 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            viewBox="0 0 24 24"
          >
            <path d="M4 12l6 6L20 6" />
          </svg>
        )}
        {isIndeterminate && !checked && (
          <span className="absolute h-0.5 w-3 rounded-full bg-white" />
        )}
      </motion.span>

      {label && (
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {label}
        </span>
      )}
    </label>
  );
};
