'use client';

import '@/app/globals.css';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChatPanel } from '@/components/chat-panel';
import { ThreadSidebar } from '@/components/thread-sidebar';
import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

interface Thread {
    id: string;
    title?: string;
    createdAt?: string;
}

function ChatPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const threadId = searchParams.get('threadId');

    const [threads, setThreads] = useState<Thread[]>([]);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);
    const [newChatInput, setNewChatInput] = useState('');

    const fetchThreads = useCallback(async () => {
        const res = await fetch('/api/threads');
        const data = await res.json();
        setThreads(data);
    }, []);

    useEffect(() => {
        fetchThreads();
    }, [fetchThreads]);

    useEffect(() => {
        if (threadId && pendingMessage) {
            setPendingMessage(null);
        }
    }, [threadId, pendingMessage]);

    const handleNewChat = () => {
        router.push('/chat');
    };

    const handleSelectThread = (id: string) => {
        router.push(`/chat?threadId=${id}`);
    };

    const handleTitleUpdate = useCallback((id: string, title: string) => {
        setThreads((prev) =>
            prev.map((t) => (t.id === id ? { ...t, title } : t))
        );
    }, []);

    const handleDeleteThread = async (id: string) => {
        await fetch(`/api/threads/${id}`, { method: 'DELETE' });
        setThreads((prev) => prev.filter((t) => t.id !== id));
        if (threadId === id) {
            router.push('/chat');
        }
    };

    const handleNewChatSubmit = () => {
        const text = newChatInput.trim();
        if (!text) return;
        setNewChatInput('');
        setPendingMessage(text);
    };

    const handleThreadCreated = useCallback((newThreadId: string) => {
        router.replace(`/chat?threadId=${newThreadId}`);
        fetchThreads();
    }, [router, fetchThreads]);

    return (
        <div className="flex h-screen">
            <ThreadSidebar
                threads={threads}
                activeThreadId={threadId}
                onSelectThread={handleSelectThread}
                onNewChat={handleNewChat}
                onDeleteThread={handleDeleteThread}
            />
            <div className="flex-1">
                {(threadId || pendingMessage) ? (
                    <ChatPanel
                        key={threadId || 'new'}
                        threadId={threadId || undefined}
                        onThreadCreated={handleThreadCreated}
                        onTitleUpdate={handleTitleUpdate}
                        initialMessage={!threadId ? pendingMessage : null}
                    />
                ) : (
                    <div className="w-full p-6 relative size-full h-screen">
                        <div className="flex flex-col h-full">
                            <div className="flex-1" />
                            <PromptInput onSubmit={handleNewChatSubmit} className="mt-20">
                                <PromptInputBody>
                                    <PromptInputTextarea
                                        onChange={(e) => setNewChatInput(e.target.value)}
                                        className="md:leading-10"
                                        value={newChatInput}
                                        placeholder="Type your message..."
                                    />
                                </PromptInputBody>
                            </PromptInput>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function ChatPageWrapper() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
            <ChatPage />
        </Suspense>
    );
}
