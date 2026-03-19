"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  name?: string;
  value?: string;
  defaultValue?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
};

export function CustomSelect({
  name,
  value: controlledValue,
  defaultValue,
  options,
  onChange,
  placeholder,
  className,
  size = "md",
}: Props) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const ref = useRef<HTMLDivElement>(null);

  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  function handleSelect(optionValue: string) {
    if (controlledValue === undefined) setInternalValue(optionValue);
    onChange?.(optionValue);
    setOpen(false);
  }

  const isSmall = size === "sm";

  return (
    <div ref={ref} className={cn("relative", className)}>
      {name && <input type="hidden" name={name} value={value} />}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-[10px] border border-zinc-800 bg-zinc-900/50 text-left transition-colors",
          "hover:border-zinc-700 focus:outline-none focus:border-[#6366f1]/50",
          open && "border-[#6366f1]/50",
          isSmall ? "px-2 py-1.5 text-xs" : "px-3 py-2.5 text-sm"
        )}
      >
        <span className={selected ? "text-zinc-100" : "text-zinc-500"}>
          {selected?.label ?? placeholder ?? "Kies een optie"}
        </span>
        <ChevronDown
          className={cn(
            "shrink-0 text-zinc-500 transition-transform duration-200",
            open && "rotate-180",
            isSmall ? "h-3 w-3" : "h-4 w-4"
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-1.5 w-full overflow-hidden rounded-[10px] border border-zinc-800 bg-zinc-900 shadow-xl">
          {options.map((option) => (
            <button
              key={option.value || option.label}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between px-3 text-left transition-colors",
                isSmall ? "text-xs py-2" : "text-sm py-2.5",
                option.value === value
                  ? "bg-[#6366f1]/10 text-[#818cf8]"
                  : "text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
              )}
            >
              {option.label}
              {option.value === value && (
                <span className="text-[#6366f1] text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
