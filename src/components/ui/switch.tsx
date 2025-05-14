"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"
import { Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group relative inline-flex items-center bg-input dark:bg-input/80 h-8 w-16 p-1 rounded-full transition-all outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {/* Left icon (moon) always visible, but show black when under thumb */}
      <Moon
        className={cn(
          "absolute left-1 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-white z-10 ml-1",
          "group-data-[state=unchecked]:text-black",
          "group-data-[state=unchecked]:dark:text-black"
        )}
      />
      {/* Right icon (sun) always visible, but show black when under thumb */}
      <Sun
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 h-4 w-4 text-black dark:text-white z-10 mr-1",
          "group-data-[state=checked]:text-black",
          "group-data-[state=checked]:dark:text-black"
        )}
      />
      {/* Thumb */}
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "relative z-0 bg-background dark:bg-foreground block w-6 h-6 rounded-full transition-transform duration-300 ease-in-out",
          "data-[state=checked]:translate-x-12 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
