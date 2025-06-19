"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ModeTheme {
    theme?: string
    setTheme: (theme: string) => void
}

export function ModeToggle({ theme, setTheme }: ModeTheme) {
    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")
            }
            className="transition-colors cursor-pointer duration-500 p-2 rounded-full border "
        >
            {theme === "light" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" color="black" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" color="white" />
            )}

        </button>
    )
}
