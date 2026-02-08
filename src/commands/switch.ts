import chalk from 'chalk'
import { getAllAccounts, getAccountByAlias, getAccountByIndex, switchAccount, getCurrentAccount } from '../lib/session.js'

export function switchToAccount(identifier?: string): void {
  const accounts = getAllAccounts()

  if (accounts.length === 0) {
    console.log(chalk.red('Error: No accounts found.'))
    console.log(chalk.gray('Use Shopify CLI to login first: shopify auth login'))
    process.exit(1)
  }

  if (accounts.length === 1) {
    const success = switchAccount(accounts[0].alias)
    if (success) {
      console.log(chalk.green(`✓ Switched to ${accounts[0].alias}`))
      console.log(chalk.gray(`Stores: ${accounts[0].stores.join(', ') || 'None'}`))
    }
    return
  }

  if (!identifier) {
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
    return
  }

  const num = parseInt(identifier)
  if (!isNaN(num)) {
    if (num < 1 || num > accounts.length) {
      console.log(chalk.red(`Error: Account number ${num} is out of range.`))
      console.log(chalk.gray(`Valid range: 1-${accounts.length}`))
      process.exit(1)
    }
    const account = getAccountByIndex(num - 1)
    if (account) {
      const success = switchAccount(account.alias)
      if (success) {
        console.log(chalk.green(`✓ Switched to ${account.alias} (Account #${num})`))
        console.log(chalk.gray(`Stores: ${account.stores.join(', ') || 'None'}`))
      } else {
        console.log(chalk.red('Error: Failed to switch account.'))
        process.exit(1)
      }
    }
    return
  }

  const account = getAccountByAlias(identifier)
  if (account) {
    const success = switchAccount(account.alias)
    if (success) {
      console.log(chalk.green(`✓ Switched to ${account.alias}`))
      console.log(chalk.gray(`Stores: ${account.stores.join(', ') || 'None'}`))
    } else {
      console.log(chalk.red('Error: Failed to switch account.'))
      process.exit(1)
    }
  } else {
    console.log(chalk.red(`Error: Account "${identifier}" not found.`))
    console.log(chalk.gray('Use "shopify-acc list" to see available accounts.'))
    process.exit(1)
  }
}
