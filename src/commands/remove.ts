import chalk from 'chalk'
import { removeAccount, getAccountByAlias } from '../lib/session.js'

export function removeAccountCmd(alias: string): void {
  if (!alias) {
    console.log(chalk.red('Error: Alias is required.'))
    console.log(chalk.gray('Usage: shopify-acc remove <alias>'))
    process.exit(1)
  }

  const account = getAccountByAlias(alias)
  if (!account) {
    console.log(chalk.red(`Error: Account "${alias}" not found.`))
    console.log(chalk.gray('Use "shopify-acc list" to see available accounts.'))
    process.exit(1)
  }

  const success = removeAccount(alias)
  if (success) {
    console.log(chalk.green(`✓ Removed ${alias}`))
  } else {
    console.log(chalk.red('Error: Failed to remove account.'))
    process.exit(1)
  }
}
