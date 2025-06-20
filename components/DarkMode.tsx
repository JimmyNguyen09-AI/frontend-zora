"use client"

import { Moon, Sun } from "lucide-react"
import RoundButton from "./common/RoundButton"

interface ModeTheme {
    theme?: string
    setTheme: (theme: string) => void
}

export function ModeToggle({ theme, setTheme }: ModeTheme) {
    return (
        <RoundButton
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            Icon={theme === "light" ? Sun : Moon}
        />
    )
}
