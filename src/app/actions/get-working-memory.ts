'use server';

import { mastra } from '@/mastra';

export type WorkingMemoryState = {
  workingMemory: string | null;
  error: string | null;
};

export async function getWorkingMemory(
  _prevState: WorkingMemoryState,
  formData: FormData,
): Promise<WorkingMemoryState> {
  const threadId = formData.get('threadId') as string;
  if (!threadId) {
    return { workingMemory: null, error: 'threadId is required' };
  }

  const memory = await mastra.getAgent('supportAgent').getMemory();
  if (!memory) {
    return { workingMemory: null, error: 'Memory not configured' };
  }

  const workingMemory = await memory.getWorkingMemory({
    threadId,
  });

  return { workingMemory, error: null };
}
