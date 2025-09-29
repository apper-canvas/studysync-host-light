import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = forwardRef((props, ref) => {
  const { className, type = "text", ...restProps } = props;
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
        className
      )}
      ref={ref}
      {...restProps}
    />
  );
});

Input.displayName = "Input";

export default Input;