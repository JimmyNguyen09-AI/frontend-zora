'use client'

import { useRef, useState } from 'react'
import { Send, Paperclip, LoaderPinwheel, X, PencilOff } from 'lucide-react'

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
]
const MAX_FILES = 3
const MAX_FILE_SIZE_MB = 5

export default function ChatInput({
    onSend,
    isStreaming,
    onStop,
    deepResearch,
    setDeepResearch

}: {
    onSend: (text: string) => void
    isStreaming: boolean
    onStop: () => void
    deepResearch: boolean
    setDeepResearch: React.Dispatch<React.SetStateAction<boolean>>
}) {
    const [input, setInput] = useState('')
    const [attachedFiles, setAttachedFiles] = useState<File[]>([])

    const [errorMsg, setErrorMsg] = useState('')
    const fileInputRef = useRef<HTMLInputElement | null>(null)

    const handleSend = () => {
        if (!input.trim()) return
        onSend(input)
        setInput('')
        setAttachedFiles([])
        setErrorMsg('')
    }

    const handleAttachClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        const newFiles: File[] = []
        let rejectedReason = ''

        for (const file of Array.from(files)) {
            if (!ACCEPTED_TYPES.includes(file.type)) {
                rejectedReason = '❌ Only .pdf, .docx or .txt files allowed.'
                continue
            }

            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                rejectedReason = `❌ ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB`
                continue
            }

            if (attachedFiles.length + newFiles.length >= MAX_FILES) {
                rejectedReason = `❌ Max ${MAX_FILES} files allowed`
                break
            }

            newFiles.push(file)
        }

        setAttachedFiles(prev => [...prev, ...newFiles])
        setErrorMsg(rejectedReason)
    }

    const removeFile = (index: number) => {
        setAttachedFiles(prev => prev.filter((_, i) => i !== index))
        setErrorMsg('')
    }

    const handleDeepResearch = () => {
        setDeepResearch(!deepResearch)
    }

    return (
        <div className="w-full  px-3 py-4  ">
            <div className="bg-[#1f1f1f] border border-[#333] rounded-full px-5 py-3 flex items-center gap-3 shadow-lg focus-within:ring-2 focus-within:ring-white/20 transition-all">
                {/* Attach button */}
                <div className="relative">
                    <button
                        onClick={handleAttachClick}
                        className="text-white hover:text-gray-300 transition disabled:cursor-not-allowed cursor-pointer"
                        disabled={attachedFiles.length >= MAX_FILES}
                    >
                        <Paperclip size={20} />
                    </button>
                    {attachedFiles.length >= MAX_FILES && (
                        <div className="absolute bottom-full left-1/2 w-[8rem] -translate-x-1/2 mb-2 px-3 py-2 bg-red-600/40 text-white text-xs rounded-lg shadow-lg z-10 before:content-[''] before:absolute before:top-full before:left-1/2 before:-translate-x-1/2 before:border-8 before:border-transparent before:border-t-red-600/40">
                            Maximum 3 files (.pdf, .docx, .txt), each ≤ 5MB.
                        </div>
                    )}
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={handleFileChange}
                />

                {/* Text input */}
                <textarea
                    rows={1}
                    className="flex-1 bg-transparent text-white resize-none focus:outline-none placeholder-gray-400 text-sm max-h-32 overflow-y-auto leading-[22px]"
                    placeholder="Ask me anything..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement
                        target.style.height = 'auto'
                        target.style.height = `${Math.min(target.scrollHeight, 132)}px`
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSend()
                        }
                    }}
                    disabled={isStreaming}
                />

                {/* Gửi hoặc Stop */}
                {isStreaming ? (
                    <button
                        onClick={onStop}
                        className="bg-white text-black p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition cursor-pointer  "
                    >
                        <PencilOff size={16} />
                    </button>
                ) : (
                    <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-white text-black p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition"
                    >
                        <Send size={16} />
                    </button>
                )}
            </div>

            {/* Files list */}
            {attachedFiles.length > 0 && (
                <div className="mt-2 text-xs text-white/80 px-2 space-y-1">
                    {attachedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between gap-2 bg-white/5 px-3 py-1.5 rounded-lg">
                            <span className="truncate">
                                📎 <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                            <button
                                onClick={() => removeFile(idx)}
                                className="text-gray-400 hover:text-red-400 transition"
                                title="Remove"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Error message */}
            {errorMsg && (
                <div className="mt-2 text-xs text-red-400 px-2">{errorMsg}</div>
            )}

            {/* Deep Research */}
            <div className="flex flex-wrap gap-2 mt-4 text-md">
                <ActionButton
                    label="Deep Research"
                    icon={
                        <LoaderPinwheel
                            className={`${deepResearch ? 'animate-spin ease duration-1000' : ''}`}
                            size={20}
                        />
                    }
                    action={handleDeepResearch}
                    state={deepResearch}
                />
            </div>


        </div>
    )
}

function ActionButton({
    label,
    icon,
    action,
    state
}: {
    label: string
    icon: React.ReactNode | string
    action: () => void
    state: boolean
}) {
    return (
        <button
            onClick={action}
            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-full transition-all
        ${state ? 'bg-white/40 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'}`}
        >
            {typeof icon === 'string' ? <span>{icon}</span> : icon}
            <span>{label}</span>
        </button>
    )
}
