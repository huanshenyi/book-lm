import { mastra } from '@/mastra';
import { NextResponse } from 'next/server';

const RESOURCE_ID = 'default-user';

export async function GET() {
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json([]);
    }

    try {
        const result = await memory.listThreads({
            filter: { resourceId: RESOURCE_ID },
            orderBy: { field: 'createdAt', direction: 'DESC' },
        });
        return NextResponse.json(result.threads);
    } catch {
        return NextResponse.json([]);
    }
}

export async function POST(req: Request) {
    const memory = await mastra.getAgentById('weather-agent').getMemory();
    if (!memory) {
        return NextResponse.json({ error: 'Memory not configured' }, { status: 500 });
    }

    let body: Record<string, unknown> = {};
    try {
        body = await req.json();
    } catch {
        // body が空の場合は無視
    }

    const thread = await memory.createThread({
        resourceId: RESOURCE_ID,
    });

    return NextResponse.json(thread);
}
