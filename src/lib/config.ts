import Conf from 'conf'
import type { ConfSchema, SessionsMap } from './types.js'

const config = new Conf<ConfSchema>({
  projectName: 'shopify-cli-kit'
})

export function getSessions(): SessionsMap {
  try {
    const sessionStore = config.get('sessionStore')
    if (!sessionStore) return {}
    return JSON.parse(sessionStore) as SessionsMap
  } catch {
    return {}
  }
}

export function setSessions(sessions: SessionsMap): void {
  config.set('sessionStore', JSON.stringify(sessions))
}

export function getCurrentSessionId(): string | undefined {
  return config.get('currentSessionId')
}

export function setCurrentSessionId(id: string): void {
  config.set('currentSessionId', id)
}

export function clearCurrentSessionId(): void {
  config.delete('currentSessionId')
}

export function getConfigPath(): string {
  return config.path
}
