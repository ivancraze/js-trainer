import type { Task } from '../tasks/tasksRegistry'

export type TaskStatus = 'success' | 'failed'
export type TaskStatuses = Record<string, TaskStatus>

export const getSavedCode = (task: Task): string =>
  localStorage.getItem(`task-code:${task.id}`) ?? task.starterCode

export const saveTaskCode = (taskId: string, code: string): void => {
  localStorage.setItem(`task-code:${taskId}`, code)
}

export const getSavedStatuses = (): TaskStatuses => {
  const savedValue = localStorage.getItem('task-statuses')

  if (!savedValue) {
    return {}
  }

  try {
    return JSON.parse(savedValue) as TaskStatuses
  } catch {
    return {}
  }
}

export const saveTaskStatuses = (statuses: TaskStatuses): void => {
  localStorage.setItem('task-statuses', JSON.stringify(statuses))
}
