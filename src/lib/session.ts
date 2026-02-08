import { getSessions, setSessions, getCurrentSessionId, setCurrentSessionId, clearCurrentSessionId, getConfigPath } from './config.js'
import type { AccountInfo, SessionData } from './types.js'

export function getAllAccounts(): AccountInfo[] {
  const sessions = getSessions()
  const currentSessionId = getCurrentSessionId()
  const accounts: AccountInfo[] = []

  for (const [fqdn, users] of Object.entries(sessions)) {
    for (const [userId, sessionData] of Object.entries(users)) {
      const alias = sessionData.identity.alias || userId
      const stores: string[] = []

      for (const [appId, appToken] of Object.entries(sessionData.applications)) {
        if (appToken.storeFqdn && !stores.includes(appToken.storeFqdn)) {
          stores.push(appToken.storeFqdn)
        }
      }

      accounts.push({
        alias,
        userId,
        fqdn,
        stores,
        isCurrent: currentSessionId === userId
      })
    }
  }

  return accounts
}

export function getAccountByAlias(alias: string): AccountInfo | undefined {
  const accounts = getAllAccounts()
  return accounts.find(acc => acc.alias === alias)
}

export function getAccountByIndex(index: number): AccountInfo | undefined {
  const accounts = getAllAccounts()
  if (index < 0 || index >= accounts.length) {
    return undefined
  }
  return accounts[index]
}

export function switchAccount(alias: string): boolean {
  const account = getAccountByAlias(alias)
  if (!account) return false

  setCurrentSessionId(account.userId)
  return true
}

export function switchAccountByIndex(index: number): boolean {
  const account = getAccountByIndex(index)
  if (!account) return false

  setCurrentSessionId(account.userId)
  return true
}

export function removeAccount(alias: string): boolean {
  const sessions = getSessions()
  const account = getAccountByAlias(alias)
  if (!account) return false

  const { fqdn, userId } = account
  delete sessions[fqdn][userId]

  if (Object.keys(sessions[fqdn]).length === 0) {
    delete sessions[fqdn]
  }

  setSessions(sessions)

  const currentSessionId = getCurrentSessionId()
  if (currentSessionId === userId) {
    setCurrentSessionId(getAllAccounts()[0]?.userId || '')
  }

  return true
}

export function getCurrentAccount(): AccountInfo | undefined {
  const accounts = getAllAccounts()
  return accounts.find(acc => acc.isCurrent)
}

export function isSessionValid(sessionData: SessionData): boolean {
  const expiresAt = new Date(sessionData.identity.expiresAt)
  return expiresAt > new Date()
}

export function clearCurrentSessionId(): void {
  clearCurrentSessionId()
}
