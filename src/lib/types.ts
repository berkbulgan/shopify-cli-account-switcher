export interface IdentityToken {
  accessToken: string
  refreshToken: string
  expiresAt: string
  scopes: string[]
  userId: string
  alias?: string
}

export interface ApplicationToken {
  accessToken: string
  expiresAt: string
  scopes: string[]
  storeFqdn?: string
}

export interface SessionData {
  identity: IdentityToken
  applications: Record<string, ApplicationToken>
}

export interface SessionsMap {
  [fqdn: string]: {
    [userId: string]: SessionData
  }
}

export interface ConfSchema {
  sessionStore: string
  currentSessionId?: string
}

export interface AccountInfo {
  alias: string
  userId: string
  fqdn: string
  stores: string[]
  isCurrent: boolean
}
