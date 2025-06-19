"use client"

import Image from 'next/image'
import { TextSearch } from 'lucide-react'
import { ModeToggle } from '../../_components/DarkMode'

interface ChatHeaderProps {
    onToggleHistory: () => void
    theme?: string
    setTheme: (theme: string) => void
}

export default function ChatHeader({ onToggleHistory, theme, setTheme }: ChatHeaderProps) {
    return (
        <div className="fixed top-0 left-0 w-full z-50 flex flex-col  md:flex-row md:justify-between md:items-center p-4 ">
            <div className='w-14 h-14 md:w-20 md:h-14 '><Image src="/logo-JN.png" alt="Logo" width={60} height={60} /></div>

            <div className='flex flex-col inline-flex md:flex-row md:items-center'>
                <button
                    onClick={onToggleHistory}
                    className="text-black dark:text-white border border-black/20 dark:border-white/20 
             hover:bg-black/10 dark:hover:bg-white/10  cursor-pointer
             rounded-full w-9 h-9 inline-flex items-center justify-center ml-2 mb-2 md:mb-0"
                >
                    <TextSearch className="w-5 h-5" />
                </button>
                <ModeToggle theme={theme} setTheme={setTheme} />
            </div>
        </div>
    )
}