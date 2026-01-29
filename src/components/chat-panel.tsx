'use client';

import { useEffect, useRef, useState } from 'react';
import { DefaultChatTransport, ToolUIPart } from 'ai';
import { useChat } from '@ai-sdk/react';

import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
} from '@/components/ai-elements/prompt-input';

import {
    Conversation,
    ConversationContent,
    ConversationScrollButton,
} from '@/components/ai-elements/conversation';

import { Message, MessageContent, MessageResponse } from '@/components/ai-elements/message';

import {
    Tool,
    ToolHeader,
    ToolContent,
    ToolInput,
    ToolOutput,
} from '@/components/ai-elements/tool';

interface ChatPanelProps {
    threadId?: string;
    onThreadCreated?: (threadId: string) => void;
    onTitleUpdate?: (threadId: string, title: string) => void;
    initialMessage?: string | null;
}

export function ChatPanel({ threadId, onThreadCreated, onTitleUpdate, initialMessage }: ChatPanelProps) {
    const [input, setInput] = useState('');
    const prevStatusRef = useRef<string>('ready');
    const titleCheckedRef = useRef(false);
    const initialMessageSentRef = useRef(false);
    const threadCreatedNotifiedRef = useRef(false);

    const threadIdRef = useRef(threadId);
    const onThreadCreatedRef = useRef(onThreadCreated);
    onThreadCreatedRef.current = onThreadCreated;

    const { messages, setMessages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
            body: () => threadIdRef.current ? { threadId: threadIdRef.current } : {},
            fetch: async (url, init) => {
                const response = await globalThis.fetch(url, init);
                const newThreadId = response.headers.get('X-Thread-Id');
                if (newThreadId && !threadIdRef.current) {
                    threadIdRef.current = newThreadId;
                }
                return response;
            },
        }),
    });

    useEffect(() => {
        if (!threadId) return;
        const fetchMessages = async () => {
            const res = await fetch(`/api/chat?threadId=${threadId}`);
            const data = await res.json();
            setMessages([...data]);
        };
        fetchMessages();
    }, [threadId, setMessages]);

    useEffect(() => {
        if (initialMessage && !initialMessageSentRef.current) {
            initialMessageSentRef.current = true;
            sendMessage({ text: initialMessage });
        }
    }, [initialMessage, sendMessage]);

    useEffect(() => {
        const currentThreadId = threadIdRef.current;
        if (!currentThreadId) return;

        if (prevStatusRef.current !== 'ready' && status === 'ready') {
            // ストリーム完了後にスレッド作成を親に通知（再マウントをトリガー）
            if (!threadId && !threadCreatedNotifiedRef.current) {
                threadCreatedNotifiedRef.current = true;
                onThreadCreatedRef.current?.(currentThreadId);
            }

            if (!titleCheckedRef.current) {
                titleCheckedRef.current = true;
                let attempt = 0;
                const maxAttempts = 5;
                const interval = 1000;

                const poll = async () => {
                    const res = await fetch(`/api/threads/${currentThreadId}`);
                    if (!res.ok) return;
                    const thread = await res.json();
                    if (thread.title && thread.title !== 'New Chat') {
                        onTitleUpdate?.(currentThreadId, thread.title);
                        return;
                    }
                    attempt++;
                    if (attempt < maxAttempts) {
                        setTimeout(poll, interval);
                    }
                };
                poll();
            }
        }
        prevStatusRef.current = status;
    }, [status, threadId, onTitleUpdate]);

    const handleSubmit = async () => {
        if (!input.trim()) return;
        sendMessage({ text: input });
        setInput('');
    };

    return (
        <div className="w-full p-6 relative size-full h-screen">
            <div className="flex flex-col h-full">
                <Conversation>
                    <ConversationContent>
                        {messages.map((message) => (
                            <div key={message.id}>
                                {message.parts?.map((part, i) => {
                                    if (part.type === 'text') {
                                        return (
                                            <Message
                                                key={`${message.id}-${i}`}
                                                from={message.role}>
                                                <MessageContent>
                                                    <MessageResponse>{part.text}</MessageResponse>
                                                </MessageContent>
                                            </Message>
                                        );
                                    }

                                    if (part.type?.startsWith('tool-')) {
                                        return (
                                            <Tool key={`${message.id}-${i}`}>
                                                <ToolHeader
                                                    type={(part as ToolUIPart).type}
                                                    state={(part as ToolUIPart).state || 'output-available'}
                                                    className="cursor-pointer"
                                                />
                                                <ToolContent>
                                                    <ToolInput input={(part as ToolUIPart).input || {}} />
                                                    <ToolOutput
                                                        output={(part as ToolUIPart).output}
                                                        errorText={(part as ToolUIPart).errorText}
                                                    />
                                                </ToolContent>
                                            </Tool>
                                        );
                                    }

                                    return null;
                                })}
                            </div>
                        ))}
                        <ConversationScrollButton />
                    </ConversationContent>
                </Conversation>

                <PromptInput onSubmit={handleSubmit} className="mt-20">
                    <PromptInputBody>
                        <PromptInputTextarea
                            onChange={(e) => setInput(e.target.value)}
                            className="md:leading-10"
                            value={input}
                            placeholder="Type your message..."
                            disabled={status !== 'ready'}
                        />
                    </PromptInputBody>
                </PromptInput>
            </div>
        </div>
    );
}
