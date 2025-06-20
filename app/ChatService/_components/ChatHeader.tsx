"use client"

import Image from 'next/image'
import { SquarePen, TextSearch } from 'lucide-react'
import { ModeToggle } from '../../../components/DarkMode'
import RoundButton from '@/components/common/RoundButton'

interface ChatHeaderProps {
    onToggleHistory: () => void
    theme?: string
    setTheme: (theme: string) => void
    newChat: () => void
}

export default function ChatHeader({ onToggleHistory, theme, setTheme, newChat }: ChatHeaderProps) {
    return (
        <div className="fixed top-0 left-0 w-full z-50 flex md:flex-row md:justify-between md:items-center p-1 md:p-4 ">
            <div className='w-14 h-14 md:w-20 md:h-14 '><Image src="/logo-JN.png" alt="Logo" width={60} height={60} /></div>

            <div className='flex  inline-flex md:flex-row md:items-center'>
                <RoundButton
                    onClick={onToggleHistory}
                    Icon={TextSearch}
                />
                <RoundButton
                    onClick={newChat}
                    Icon={SquarePen}
                />
                <ModeToggle theme={theme} setTheme={setTheme} />
            </div>
        </div >
    )
}