'use client'
import { Trash2 } from "lucide-react"

interface Message {
    question: string
    answer: string
}

interface ChatHistoryItem {
    id: number
    title: string
    messages: Message[]
}

interface Props {
    history: ChatHistoryItem[]
    selected: number | null
    onSelect: (convID: number) => void
    onDelete: (convID: number) => void
}

export default function ChatHistory({ history, selected, onSelect, onDelete }: Props) {
    return (
        <div className="pt-14 px-2 ">
            {/* Tiêu đề */}
            <h2 className="text-lg font-semibold mb-6 ml-2 text-black  dark:text-white">Chat History</h2>

            {/* Danh sách cuộc trò chuyện */}
            <div className="space-y-2">
                {history.map((item) => (
                    <div
                        key={item.id}
                        className={`group relative flex items-center justify-between px-4 py-3 rounded-lg cursor-pointer transition-all duration-200
                            ${selected === item.id
                                ? 'bg-gray-300 dark:bg-gray-700'
                                : 'hover:bg-gray-200 dark:hover:bg-gray-800'
                            }`}
                        onClick={() => onSelect(item.id)}
                    >
                        {/* Tên cuộc trò chuyện */}
                        <span className="truncate text-sm text-black dark:text-white">
                            {item.title.length > 25 ? item.title.slice(0, 25) + '...' : item.title}
                        </span>

                        {/* Icon xoá */}
                        <Trash2
                            size={18}
                            className="text-red-500 opacity-80 hover:text-red-700 transition"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(item.id)
                            }}
                        />
                        {/* Preview on hover */}
                        {item.messages?.length > 0 && (
                            <div className="absolute left-full top-1/2 z-20 ml-2 w-56 -translate-y-1/2 rounded-lg border border-gray-400 bg-white p-3 text-xs shadow-lg dark:bg-[#2a2a2a] dark:text-white hidden group-hover:block">
                                <p className="font-semibold text-black dark:text-gray-100 truncate">
                                    {item.messages[0].question}
                                </p>
                                {item.messages[0].answer && (
                                    <p className="mt-1 text-gray-600 dark:text-gray-300 truncate">
                                        {item.messages[0].answer}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
