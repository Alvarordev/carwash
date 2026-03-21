"use client";

import { useState } from "react";
import { Check, NavArrowDown } from "iconoir-react";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { QUOTE_COLOR_THEMES } from "@/lib/schemas/quote";
import type { QuoteFormData } from "@/lib/schemas/quote";

type QuoteColorPickerProps = Readonly<{
  control: Control<QuoteFormData>;
}>;

const LIGHT_COLORS = ["#EAB308"];

export function QuoteColorPicker({ control }: QuoteColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      control={control}
      name="colorTheme"
      render={({ field }) => (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between bg-card border-border rounded-md font-normal"
            >
              <span className="flex items-center gap-2">
                <span
                  className="w-5 h-5 rounded-full border border-border shrink-0"
                  style={{ backgroundColor: field.value }}
                />
                <span className="font-mono text-sm">{field.value}</span>
              </span>
              <NavArrowDown className="w-4 h-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-card border-border rounded-md p-3 w-[220px]">
            <div className="grid grid-cols-6 gap-2">
              {QUOTE_COLOR_THEMES.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => {
                    field.onChange(color);
                    setOpen(false);
                  }}
                  className="relative w-7 h-7 rounded-full border border-border transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary"
                  style={{ backgroundColor: color }}
                  title={color}
                >
                  {field.value === color && (
                    <Check
                      className="absolute inset-0 m-auto w-3.5 h-3.5"
                      style={{ color: LIGHT_COLORS.includes(color) ? "#000" : "#fff" }}
                    />
                  )}
                </button>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    />
  );
}
