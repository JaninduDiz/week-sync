'use server';

import { suggestTasks as suggestTasksFlow, type SuggestTasksInput, type SuggestTasksOutput } from '@/ai/flows/suggest-tasks';

export async function suggestTasksAction(input: SuggestTasksInput): Promise<{ tasks: string[]; error: string | null; }> {
    try {
        const result: SuggestTasksOutput = await suggestTasksFlow(input);
        return { tasks: result.tasks, error: null };
    } catch (e) {
        console.error(e);
        const error = e instanceof Error ? e.message : 'An unknown error occurred while suggesting tasks.';
        return { tasks: [], error };
    }
}
