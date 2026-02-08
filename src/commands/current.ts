import chalk from 'chalk'
import { getCurrentAccount } from '../lib/session.js'
import { getSessions } from '../lib/config.js'

export function showCurrentAccount(): void {
  const account = getCurrentAccount()

  if (!account) {
    console.log(chalk.yellow('No active account found.'))
    console.log(chalk.gray('Use "shopify-acc list" to see available accounts.'))
    console.log(chalk.gray('Use "shopify-acc switch <alias>" to set an active account.'))
    return
  }

  const sessions = getSessions()
  const sessionData = sessions[account.fqdn][account.userId]
  const expiresAt = new Date(sessionData.identity.expiresAt)
  const isValid = expiresAt > new Date()

  console.log(chalk.bold.cyan('Current Account:'))
  console.log()
  console.log(chalk.green(`  Alias: ${account.alias}`))
  console.log(chalk.gray(`  User ID: ${account.userId}`))
  console.log(chalk.gray(`  FQDN: ${account.fqdn}`))
  console.log(chalk.gray(`  Stores: ${account.stores.join(', ') || 'None'}`))
  console.log(chalk.gray(`  Expires: ${expiresAt.toLocaleString()}`))
  console.log(chalk.gray(`  Status: ${isValid ? chalk.green('Valid') : chalk.red('Expired')}`))
}
