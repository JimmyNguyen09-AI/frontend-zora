'use client'
import { useParams } from 'next/navigation'
import ChatUI from '../../main_chat/ChatUI'

export default function ChatPageWrapper() {
    const rawParams = useParams() as { userID: string }
    const userID = Number(rawParams.userID)
    return <ChatUI userID={userID} />
}
