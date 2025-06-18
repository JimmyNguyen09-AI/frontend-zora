"use client"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function HomePage() {
  const [userId, setUserId] = useState("")
  const router = useRouter()

  const handleStart = () => {
    if (userId) router.push(`/chat/${userId}`)
  }

  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nhập User ID để bắt đầu chat</h1>
      <input
        className="border p-2 w-full mb-4"
        placeholder="Nhập user ID (ví dụ: 1)"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
      />
      <button onClick={handleStart} className="bg-blue-600 text-white px-4 py-2 rounded">
        Bắt đầu chat
      </button>
    </main>
  )
}
