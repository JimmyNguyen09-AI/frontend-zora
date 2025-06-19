/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */


'use client'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatInput from './_components/ChatInput'
import CodeBlock from '../../components/CodeBlock'
import ChatHistory from './_components/ChatHistory'
import { ChevronsLeft, Menu, PencilLine, Link, ChevronsRight, X, TextSearch, Slash } from "lucide-react"
import ConfirmBlock from '../../components/ConfirmBlock'
import { useTheme } from 'next-themes'
import { ModeToggle } from '../_components/DarkMode'
import Image from 'next/image'
import TypingTitle from './_components/Typer'
import ChatHeader from './_components/ChatHeader'
interface Message {
    question: string
    answer: string
    webSearches?: string[]

}

interface ChatHistoryItem {
    id: number;
    title: string
    messages: Message[]
}

export default function ChatUI({ userID }: { userID: number }) {
    const [messages, setMessages] = useState<Message[]>([])
    const [conversationID, setConversationID] = useState<number | null>(null)
    const [history, setHistory] = useState<ChatHistoryItem[]>([])
    const [selected, setSelected] = useState<number | null>(null)
    const [isStreaming, setIsStreaming] = useState(false)
    const [isAtBottom, setIsAtBottom] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const bottomRef = useRef<HTMLDivElement>(null)
    const controllerRef = useRef<AbortController | null>(null)
    const fullAnswerRef = useRef('')
    const currentMsgIndexRef = useRef<number>(-1)
    const [loading, setLoadingHistory] = useState<boolean>(true)
    const [error, setError] = useState("")
    const [showHistory, setShowHistory] = useState<boolean>(false)
    const [webSearches, setWebSearches] = useState<string[]>([])
    const [deepResearch, setDeepResearch] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [toDeleteID, setToDeleteID] = useState<number | null>(null)
    const [showWebSearches, setShowWebSearches] = useState(false)
    const { theme, setTheme } = useTheme()
    const [voiceRecording, setVoiceRecording] = useState<boolean>(false)
    useEffect(() => {
        if (!userID) return
        fetch(`http://127.0.0.1:8000/conversations/user/${userID}`)
            .then(res => {
                if (!res.ok) throw new Error("Không tìm thấy user hoặc lỗi server")
                return res.json()
            })
            .then(data => setHistory(data))
            .catch(err => setError(err.message))
            .finally(() => setLoadingHistory(false))
    }, [userID])


    console.log(history)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return

        const handleScroll = () => {
            const threshold = 100
            const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold
            setIsAtBottom(atBottom)
        }

        el.addEventListener('scroll', handleScroll)
        return () => el.removeEventListener('scroll', handleScroll)
    }, [])

    // Auto scroll only if user is at bottom
    useEffect(() => {
        if (isAtBottom) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isAtBottom])

    const handleSend = async (text: string, useDeepResearch: boolean) => {
        if (!text.trim()) return

        const newMsg: Message = { question: text, answer: '' }
        setMessages((prev) => {
            const index = prev.length
            currentMsgIndexRef.current = index
            return [...prev, newMsg]
        })

        setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }, 50)

        setIsStreaming(true)

        try {
            controllerRef.current = new AbortController()

            let convID = conversationID

            // ✅ Nếu chưa có conversation thì tạo mới
            if (!convID) {
                const createRes = await fetch(`http://127.0.0.1:8000/conversations/user/${userID}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: `New chat ${new Date().toLocaleTimeString()}` }),
                })

                if (createRes.ok) {
                    const newConv = await createRes.json()
                    convID = newConv.id
                    setConversationID(convID)
                    setSelected(convID)

                    // Cập nhật lại history
                    const historyRes = await fetch(`http://127.0.0.1:8000/conversations/user/${userID}`)
                    const updated = await historyRes.json()
                    setHistory(updated)
                } else {
                    alert("Không thể tạo cuộc trò chuyện mới.")
                    return
                }
            }

            const chatURL = `http://127.0.0.1:8000/chat/${convID}`

            const res = await fetch(chatURL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question: text, deep_research: useDeepResearch }),
                signal: controllerRef.current.signal,
            })

            const reader = res.body?.getReader()
            if (!reader) throw new Error("No response body")
            const decoder = new TextDecoder("utf-8")
            fullAnswerRef.current = ''

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                const chunkText = decoder.decode(value, { stream: true })

                if (chunkText.startsWith("[SEARCHING]")) {
                    const url = chunkText.replace("[SEARCHING]", '').trim()
                    const index = currentMsgIndexRef.current
                    setMessages((prev) => {
                        const updated = [...prev]
                        if (updated[index]) {
                            const existing = updated[index].webSearches || []
                            updated[index].webSearches = [...existing, url]
                        }
                        return updated
                    })

                } else {
                    fullAnswerRef.current += chunkText
                    const index = currentMsgIndexRef.current
                    setMessages((prev) => {
                        const updated = [...prev]
                        if (updated[index]) updated[index].answer = fullAnswerRef.current
                        return updated
                    })
                }
            }


        } catch (err: any) {
            const index = currentMsgIndexRef.current
            if (err.name === 'AbortError') {
                console.log('⛔ Streaming aborted by user')
            } else {
                setMessages((prev) => {
                    const updated = [...prev]
                    if (updated[index]) {
                        updated[index].answer = '❌ Error occurred. Please try again.'
                    }
                    return updated
                })
            }
        } finally {
            setIsStreaming(false)
            controllerRef.current = null
        }
    }

    const handleSelectHistory = async (convID: number) => {
        setSelected(convID)
        setConversationID(convID)

        const res = await fetch(`http://127.0.0.1:8000/chat/${convID}/messages`)
        const rawMessages = await res.json()

        const parsed: Message[] = []

        for (let i = 0; i < rawMessages.length; i += 2) {
            const q = rawMessages[i]
            const a = rawMessages[i + 1]
            if (q?.role === 'user' && a?.role === 'ai') {
                parsed.push({ question: q.content, answer: a.content })
            }
        }
        setMessages(parsed)
    }


    const handleDeleteConversation = async (convID: number) => {
        try {
            const res = await fetch(`http://127.0.0.1:8000/conversations/${convID}`,
                {
                    method: 'DELETE',
                }
            );
            if (!res.ok) throw new Error('Delete failed');
            setHistory(prev => prev.filter(item => item.id !== convID))
            if (selected === convID) {
                setSelected(null);
                setMessages([]);
                setConversationID(null);
            }
        }
        catch (error) {
            alert("⚠️ Không thể xoá cuộc trò chuyện.");
        }
    }



    const handleNewConversation = async () => {
        const res = await fetch(`http://127.0.0.1:8000/conversations/user/${userID}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: `Conversation ${new Date().toLocaleTimeString()}` }),

        })

        if (res.ok) {
            const conv = await res.json()
            setConversationID(conv.id)
            setMessages([])
            setSelected(conv.id)

            // Cập nhật lại lịch sử
            const historyRes = await fetch(`http://127.0.0.1:8000/conversations/user/${userID}`)
            const updated = await historyRes.json()
            setHistory(updated)
        } else {
            alert("⚠️ Không thể tạo cuộc trò chuyện mới.")
        }
    }


    return (
        <div className="w-full h-screen flex dark:bg-[#1a1a1a] text-white font-sans">
            {/* History */}
            {showHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm">
                    <div className="relative bg-white/80 dark:bg-[#1a1a1a] border border-gray-800 rounded-xl w-full max-w-sm max-h-[80vh] p-4 pt-12 overflow-y-auto text-black dark:text-white">
                        <button onClick={handleNewConversation} className='cursor-pointer absolute top-2 left-2'>
                            <PencilLine size={24} />
                        </button>
                        <button onClick={() => setShowHistory(false)} className="absolute top-2 right-2 cursor-pointer">
                            <X size={24} />
                        </button>

                        <ChatHistory
                            history={history}
                            selected={selected}
                            onSelect={handleSelectHistory}
                            onDelete={(id) => {
                                setToDeleteID(id)
                                setConfirmOpen(true)
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Main Chat */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <ChatHeader
                    onToggleHistory={() => setShowHistory(prev => !prev)}
                    theme={theme}
                    setTheme={setTheme}
                />

                {/* Chat Content */}
                <div ref={containerRef} className="flex-1 mx- w-[95%] md:w-[80%] ml-[2.5%] md:mx-auto overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#1a1a1a] ">

                    {!messages.length && (
                        <div className="flex flex-col items-center justify-center h-[70%]">
                            <Image src="/ai-unscreen.gif" alt="Logo" width={200} height={200} />
                            <div className='flex justify-center items-center '><TypingTitle words={['Hỏi ZORA bất cứ điều gì ^^', 'Ngày hôm nay của hôm mie thế nào ^^', 'Oh sheet tôi đã lỡ va phải ánh mắt của bạn :3', 'Chat với tôi nhé :>']} />
                            </div>
                        </div>


                    )
                    }
                    {messages.map((m, i) => (
                        <div key={i} className="space-y-4">
                            {/* User message */}
                            <div className="flex justify-end">
                                <div className="flex gap-2 max-w-[75%] items-end">
                                    <div className="bg-black/10 dark:bg-[#2d2d2d] text-black dark:text-white px-4 py-3 rounded-2xl rounded-br-none shadow text-sm whitespace-pre-wrap">
                                        {m.question}
                                    </div>
                                </div>
                            </div>

                            {/* AI message */}
                            <div className="flex justify-start ">
                                <div className="flex max-w-[90%] items-start">
                                    <div className="w-9 h-9 rounded-full flex-shrink-0 overflow-hidden">
                                        {i === messages.length - 1 && isStreaming ? (
                                            <Image
                                                src="/loading.gif"
                                                alt="Loading"
                                                width={36}
                                                height={36}
                                                className="object-contain w-full h-full"
                                            />
                                        ) : (
                                            <Image
                                                src="/logo-JN.png"
                                                alt="Bot"
                                                width={36}
                                                height={36}
                                                className="object-contain w-full h-full"
                                            />
                                        )}
                                    </div>


                                    <div className="pl-2 mt-2 text-black dark:text-white rounded-2xl overflow-x-auto text-sm leading-relaxed">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ inline, className, children, ...props }: any) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const codeString = Array.isArray(children) ? children.join('') : String(children);
                                                    return !inline && match ? (
                                                        <CodeBlock language={match[1]} code={codeString.trim()} />
                                                    ) : (
                                                        <code className="bg-gray-600 dark:bg-gray-800 text-green-300 rounded px-1 font-mono text-sm" {...props}>
                                                            {codeString}
                                                        </code>
                                                    );
                                                },
                                            }}
                                        >
                                            {m.answer}
                                        </ReactMarkdown>

                                    </div>
                                </div>
                            </div>
                            {m.webSearches && m.webSearches.length > 0 && (
                                <div className="flex flex-row gap-4">
                                    {m.webSearches.map((url, i) => (
                                        <div key={`search-${i}`} className="flex items-center text-sm text-blue-400 rounded-lg py-1 max-w-[90%]">
                                            <Link size={10} className="ml-1 text-white" />

                                            <a href={url} target="_blank" className="underline break-all">{
                                                url.split("/")[2]}</a>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </div>
                    ))}



                    <div>
                        {showWebSearches && webSearches.map((url, i) => (
                            <div key={`search-${i}`} className="flex items-center justify-start text-sm text-blue-400  rounded-lg px-4 py-2 max-w-[90%]">
                                <span className='text-white'>
                                    <Link size={15} />
                                </span>
                                <a href={url} target="_blank" className="underline ml-1">{url}</a>
                            </div>
                        ))}
                    </div>


                    {/* Nếu đang suy nghĩ và chưa có phản hồi */}
                    {isStreaming && messages[messages.length - 1]?.answer === '' && (
                        <div className="flex justify-start">
                            <div className="flex gap-2 max-w-[80%] items-start">
                                <div className="bg-while/20 dark:bg-[#1e1e1e] px-4 py-3 rounded-2xl rounded-tl-none shadow-inner text-sm text-gray-800 animate-pulse">
                                    Thinking...
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />

                </div>

                {/* Chat Input */}
                <div className="px-2 w-full md:w-[80%] mx-auto robg-[#1a1a1a] border-t-2 border-gray-800 rounded-t-4xl shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
                    <ChatInput
                        onSend={(text) => handleSend(text, deepResearch)}
                        isStreaming={isStreaming}
                        onStop={() => {
                            controllerRef.current?.abort()
                            controllerRef.current = null
                            setIsStreaming(false)
                        }}
                        deepResearch={deepResearch}
                        setDeepResearch={setDeepResearch}
                        voiceRecording={voiceRecording}
                        setVoiceRecording={setVoiceRecording}
                    />
                </div>

            </main>

            {/* Confirm Delete Modal */}
            <ConfirmBlock
                isOpen={confirmOpen}
                title="Xác nhận xoá?"
                description="Hành động này sẽ xoá cuộc trò chuyện khỏi lịch sử."
                onCancel={() => {
                    setConfirmOpen(false)
                    setToDeleteID(null)
                }}
                onConfirm={() => {
                    if (toDeleteID !== null) {
                        handleDeleteConversation(toDeleteID)
                    }
                    setConfirmOpen(false)
                    setToDeleteID(null)
                }}
            />
        </div>
    )

}
