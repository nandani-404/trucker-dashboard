/**
 * Pinia stores - mirrors Redux structure for Vue website
 * Redux equivalents:
 *   auth  -> useAuthStore
 *   user  -> useUserStore
 *   job   -> useJobStore
 *   app   -> useAppStore
 */
export { useAuthStore } from './auth'
export { useUserStore } from './user'
export { useJobStore } from './job'
export { useAppStore } from './app'
export type { UserData } from './user'
export type { JobDraftForm } from './job'
export type { AuthScreen } from './app'
