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

                    </div>
                ))}
            </div>
        </div>
    )
}
