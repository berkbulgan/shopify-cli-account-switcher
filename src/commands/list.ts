import chalk from 'chalk'
import { getAllAccounts, getCurrentAccount } from '../lib/session.js'

export function listAccounts(): void {
  const accounts = getAllAccounts()

  if (accounts.length === 0) {
    console.log(chalk.yellow('No accounts found.'))
    console.log(chalk.gray('Use Shopify CLI to login first: shopify auth login'))
    return
  }

  console.log(chalk.bold.cyan('Accounts:'))
  console.log()

  for (const account of accounts) {
    console.log(`[${accounts.indexOf(account) + 1}] ${account.alias}`)
  }

  console.log()
  const currentAccount = getCurrentAccount()
  if (currentAccount) {
    console.log(chalk.green(`(*) Current account: ${currentAccount.alias}`))
  }
}
