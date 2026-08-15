// Fire-and-forget: removes a task from the pool the moment the learner
// engages with its first part, so it can't resurface after being abandoned.
export function consumeTask(taskId: string) {
  fetch('/api/consume-task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId }),
  }).catch(() => {})
}
