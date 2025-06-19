'use client'
interface ConfirmBlockProps {
    title: string
    description?: string
    isOpen: boolean
    onConfirm: () => void
    onCancel: () => void
}
export default function ConfirmBlock({
    title,
    description,
    isOpen,
    onConfirm,
    onCancel,
}: ConfirmBlockProps) {
    if (!isOpen) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 dark:bg-black/60">
            <div className="bg-gray-100 dark:bg-[#1f1f1f] dark:border-gray-700 p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4 text-black dark:text-white">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-black dark:text-gray-400">{description}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-black dark:text-white rounded-lg border border-gray-400 dark:border-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                    >
                        Huỷ
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white transition"
                    >
                        Xoá
                    </button>
                </div>
            </div>
        </div>
    )
}