"use client"

import { Moon, Sun } from "lucide-react"

interface ModeTheme {
    theme?: string
    setTheme: (theme: string) => void
}

export function ModeToggle({ theme, setTheme }: ModeTheme) {
    return (
        <button
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="w-9 h-9 inline-flex items-center justify-center rounded-full 
                 border border-black/20 dark:border-white/20 
                 hover:bg-black/10 dark:hover:bg-white/10 
                 transition-colors ml-2 cursor-pointer"
        >
            {theme === "light" ? (
                <Sun className="w-5 h-5 text-black" />
            ) : (
                <Moon className="w-5 h-5 text-white" />
            )}
        </button>
    )
}
