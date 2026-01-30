'use client';

import { useState, useActionState } from 'react';
import { getWorkingMemory, type WorkingMemoryState } from '@/app/actions/get-working-memory';

const initialState: WorkingMemoryState = {
  workingMemory: null,
  error: null,
};

export function WorkingMemoryViewer({ threadId }: { threadId: string }) {
  const [state, formAction, isPending] = useActionState(getWorkingMemory, initialState);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border rounded-lg p-3 mb-4 text-sm">
      <div className="flex items-center gap-2">
        {!isOpen ? (
          <form action={(formData) => { formAction(formData); setIsOpen(true); }}>
            <input type="hidden" name="threadId" value={threadId} />
            <button
              type="submit"
              disabled={isPending}
              className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80 disabled:opacity-50"
            >
              {isPending ? '読み込み中...' : 'Working Memory を確認'}
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted/80"
          >
            Working Memory を閉じる
          </button>
        )}
      </div>

      {isOpen && (
        <>
          {state.error && (
            <p className="text-destructive mt-2">{state.error}</p>
          )}
          {state.workingMemory && (
            <pre className="mt-2 whitespace-pre-wrap text-xs bg-muted p-2 rounded overflow-auto max-h-60">
              {state.workingMemory}
            </pre>
          )}
        </>
      )}
    </div>
  );
}
