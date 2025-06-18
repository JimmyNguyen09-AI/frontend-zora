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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#1f1f1f] border border-gray-700 p-6 rounded-xl shadow-lg w-full max-w-sm space-y-4 text-white">
                <h2 className="text-lg font-semibold">{title}</h2>
                {description && <p className="text-sm text-gray-400">{description}</p>}

                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border border-gray-500 hover:bg-gray-700 transition"
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