// A 'use server' file can only export async functions — SubmitState and
// initialSubmitState live here instead of actions.ts so submit-form.tsx can
// import them without pulling a non-function value across the server-action
// boundary.
export type SubmitState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
};

export const initialSubmitState: SubmitState = { status: 'idle' };
