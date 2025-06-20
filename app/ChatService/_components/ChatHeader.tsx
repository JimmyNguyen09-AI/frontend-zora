"use client"

import Image from 'next/image'
import { ChevronLeft, ChevronRight, SquarePen, TextSearch } from 'lucide-react'
import { ModeToggle } from '../../../components/DarkMode'
import RoundButton from '@/components/common/RoundButton'

interface ChatHeaderProps {
    onToggleHistory: () => void
    theme?: string
    setTheme: (theme: string) => void
    newChat: () => void
    showActions: boolean
    setShowActions: (show: boolean) => void
}

export default function ChatHeader({ onToggleHistory, theme, setTheme, newChat, showActions, setShowActions }: ChatHeaderProps) {
    return (
        <div className="fixed top-7 left-1 md:top-0 md:left-0 w-full z-50 flex md:justify-between md:items-center p-1 md:p-4">
            <div className="flex items-center gap-2">
                <div
                    className="w-14 h-14 md:w-20 md:h-14 cursor-pointer"
                    onClick={() => setShowActions(!showActions)}
                >
                    <Image src="/logo-JN.png" alt="Logo" width={60} height={60} />
                </div>
                <div className="md:hidden" onClick={() => setShowActions(!showActions)}>
                    {showActions ? (
                        <ChevronLeft size={24} />
                    ) : (
                        <ChevronRight size={24} />
                    )}
                </div>
            </div>

            {/* Nút điều khiển */}
            <div
                className={`transition-all duration-500 ease-in-out transform
    ${showActions ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}
    flex items-center md:flex-row md:items-center md:translate-x-0 md:opacity-100
    ${showActions ? 'flex' : 'hidden'} md:flex`}
            >
                <RoundButton onClick={onToggleHistory} Icon={TextSearch} />
                <RoundButton onClick={newChat} Icon={SquarePen} />
                <ModeToggle theme={theme} setTheme={setTheme} />
            </div>
        </div>

    )
}