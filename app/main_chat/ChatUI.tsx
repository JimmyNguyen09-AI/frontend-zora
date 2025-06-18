/* eslint-disable @typescript-eslint/no-unused-vars, @typescript-eslint/no-explicit-any */


'use client'
import { useEffect, useState, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import ChatInput from './_components/ChatInput'
import CodeBlock from '../../components/CodeBlock'
import ChatHistory from './_components/ChatHistory' // điều chỉnh đường dẫn nếu cần
import { ChevronsLeft, Menu, PencilLine, Link } from "lucide-react"
import ConfirmBlock from '../../components/ConfirmBlock'
import { useTheme } from 'next-themes'
import { ModeToggle } from '../_components/DarkMode'
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
    const [showSideBar, setShowSideBar] = useState<boolean>(false)
    const [webSearches, setWebSearches] = useState<string[]>([])
    const [deepResearch, setDeepResearch] = useState(false)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [toDeleteID, setToDeleteID] = useState<number | null>(null)
    const [showWebSearches, setShowWebSearches] = useState(false)
    const { theme, setTheme } = useTheme()

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
        <div className="w-full h-screen flex bg-[#0f0f0f] text-white font-sans">
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-white/80 dark:bg-[#1a1a1a] border-r border-gray-800 p-4 space-y-4 overflow-y-auto z-50 transform transition-transform backdrop-filter backdrop-blur-sm duration-300 ease-in-out ${showSideBar ? 'translate-x-0' : '-translate-x-full'}`}
            >
                <button onClick={handleNewConversation} className='cursor-pointer text-black dark:text-white absolute top-4 left-5'>
                    <PencilLine size={30} />
                </button>
                <button onClick={() => setShowSideBar(false)} className="absolute text-black dark:text-white top-4 right-2 cursor-pointer ">
                    <ChevronsLeft size={30} />
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

            {/* Main Chat */}
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header className="flex gap-2 p-4 border-b border-gray-800 items-center bg-white dark:bg-[#1a1a1a] shadow rounded-md">
                    <button onClick={() => setShowSideBar(prev => !prev)} className='text-white mr-4 cursor-pointer'>
                        <Menu size={23} className='text-black dark:text-white' />
                    </button>

                    <h1 className={`text-xl text-black dark:text-white font-semibold w-full ${showSideBar ? "text-center" : ""}`}>
                        ZORA
                        <span className='text-xs text-gray-500 dark:text-gray-100'>Beta version</span>
                    </h1>
                    <ModeToggle theme={theme} setTheme={setTheme} />
                </header>

                {/* Chat Content */}
                <div ref={containerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-white dark:bg-[#1a1a1a]">
                    {messages.map((m, i) => (
                        <div key={i} className="space-y-4">
                            {/* User message */}
                            <div className="flex justify-end">
                                <div className="flex gap-2 max-w-[75%] items-end">
                                    <div className="bg-[#2d2d2d] text-white px-4 py-3 rounded-2xl rounded-br-none shadow text-sm whitespace-pre-wrap">
                                        {m.question}
                                    </div>
                                </div>
                            </div>

                            {/* AI message */}
                            <div className="flex justify-start bg-white/80 dark:bg-[#1e1e1e]">
                                <div className="flex gap-2 max-w-[90%] items-start">
                                    <div className="bg-[#1e1e1e] p-4 rounded-2xl rounded-tl-none shadow-inner prose prose-invert prose-sm max-w-full overflow-x-auto text-sm leading-relaxed">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                code({ inline, className, children, ...props }: any) {
                                                    const match = /language-(\w+)/.exec(className || '');
                                                    const codeString = Array.isArray(children) ? children.join('') : String(children);
                                                    return !inline && match ? (
                                                        <CodeBlock language={match[1]} code={codeString.trim()} />
                                                    ) : (
                                                        <code className="bg-gray-800 text-green-300 rounded px-1 font-mono text-sm" {...props}>
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
                                <div className="pl-4">
                                    {m.webSearches.map((url, i) => (
                                        <div key={`search-${i}`} className="flex items-center text-sm text-blue-400 rounded-lg py-1 max-w-[90%]">
                                            <Link size={13} className="mr-1 text-white" />
                                            <a href={url} target="_blank" className="underline break-all">{url}</a>
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
                                <div className="bg-[#1e1e1e] px-4 py-3 rounded-2xl rounded-tl-none shadow-inner text-sm text-gray-400 animate-pulse">
                                    Đang suy nghĩ...
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={bottomRef} />
                </div>

                {/* Chat Input */}
                <div className="px-2 bg-[#0f0f0f] border-t-2 border-gray-800 rounded-t-4xl shadow-[0_-8px_24px_rgba(0,0,0,0.4)]">
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
