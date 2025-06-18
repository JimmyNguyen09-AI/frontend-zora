'use client'
import { useState } from 'react'
import { Copy, CopyCheck, Bot, Terminal } from 'lucide-react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'

interface CodeBoxProps {
    language: string
    code: string
}

export default function CodeBlock({ language, code }: CodeBoxProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="relative rounded-xl overflow-hidden border border-gray-700 bg-[#1e1e1e] shadow-md mb-7">
            <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-gray-700 text-sm font-mono">
                <div className="flex space-x-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                </div>
                <div className='flex space-x-2 items-center'>
                    <Terminal size={16} />
                    <span className="text-gray-300">{language}</span>
                </div>

                <button onClick={handleCopy} title="Copy" className="text-gray-400 cursor-pointer hover:text-white">
                    {copied ? (
                        <CopyCheck size={16} className="text-green-400" />
                    ) : (
                        <Copy size={16} className="hover:animate-pulse" />
                    )}
                </button>

            </div>

            {/* Code block */}
            <SyntaxHighlighter
                language={language}
                style={oneDark}
                wrapLongLines
                customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
                codeTagProps={{
                    style: { backgroundColor: 'transparent' }
                }}
            >
                {code}

            </SyntaxHighlighter>
            <div className=' absolute bottom-0 right-0 flex items-center justify-between p-2 text-xs text-gray-400'>
                <div className="p-2 text-md text-gray-400">Made by JN-AI</div>
                <Bot size={14} />
            </div>
            <div className="items-center justify-between p-2 text-xs text-gray-400"></div>
        </div>
    )
}
