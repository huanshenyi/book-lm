import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

export async function GET(
    _req: Request,
    { params }: { params: Promise<{ threadId: string }> }
) {
    const { threadId } = await params;
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ error: 'Memory not configured' }, { status: 500 });
    }

    const thread = await memory.getThreadById({ threadId });
    if (!thread) {
        return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(thread);
}

export async function DELETE(
    _req: Request,
    { params }: { params: Promise<{ threadId: string }> }
) {
    const { threadId } = await params;
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ error: 'Memory not configured' }, { status: 500 });
    }

    try {
        await memory.deleteThread(threadId);
    } catch {
        // Thread may not exist yet
    }

    return NextResponse.json({ success: true });
}
