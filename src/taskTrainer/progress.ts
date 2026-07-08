import type { TaskCheck } from '../tasks/tasksRegistry'
import type { TaskStatus } from './storage'

export const getPassedCount = (results: TaskCheck[]): number =>
  results.filter((result) => result.passed).length

export const getTaskStatus = (results: TaskCheck[]): TaskStatus =>
  results.length > 0 && getPassedCount(results) === results.length
    ? 'success'
    : 'failed'
