import { handleChatStream } from '@mastra/ai-sdk';
import { toAISdkV5Messages } from '@mastra/ai-sdk/ui'
import { createUIMessageStreamResponse } from 'ai';
import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

const RESOURCE_ID = 'default-user';

export async function POST(req: Request) {
    const params = await req.json();
    let threadId = params.threadId;

    if (!threadId) {
        const memory = await mastra.getAgentById('support-agent').getMemory();
        if (memory) {
            const thread = await memory.createThread({ resourceId: RESOURCE_ID });
            threadId = thread.id;
        }
    }

    const stream = await handleChatStream({
        mastra,
        agentId: 'support-agent',
        params: {
            ...params,
            memory: {
                thread: threadId,
                resource: RESOURCE_ID,
            }
        },
    });
    console.log('stream:', stream);
    return createUIMessageStreamResponse({
        stream,
        headers: { 'X-Thread-Id': threadId },
    });
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get('threadId');
    if (!threadId) {
        return NextResponse.json([]);
    }

    const memory = await mastra.getAgentById('support-agent').getMemory();
    if (!memory) {
        return NextResponse.json([]);
    }

    let response = null;
    try {
        response = await memory.recall({
            threadId,
            resourceId: RESOURCE_ID,
        });
    } catch {
        console.log('No previous messages found.');
    }

    const uiMessages = toAISdkV5Messages(response?.messages || []);
    return NextResponse.json(uiMessages);
}
