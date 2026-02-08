#!/usr/bin/env node

import { Command } from 'commander'
import { listAccounts } from './commands/list.js'
import { addAccount } from './commands/add.js'
import { switchToAccount } from './commands/switch.js'
import { showCurrentAccount } from './commands/current.js'
import { removeAccountCmd } from './commands/remove.js'

const program = new Command()

program
  .name('shopify-acc')
  .description('Quickly switch between multiple Shopify CLI accounts without logout/login')
  .version('1.0.0')

program
  .command('add')
  .description('Add a new Shopify account (runs shopify auth login)')
  .action(() => {
    addAccount()
  })

program
  .command('list')
  .description('List all Shopify CLI accounts')
  .action(() => {
    listAccounts()
  })

program
  .command('switch')
  .description('Switch to a specific account (by number or alias)')
  .argument('[identifier]', 'Account number or alias to switch to')
  .action((identifier) => {
    switchToAccount(identifier)
  })

program
  .command('current')
  .description('Show current active account')
  .action(() => {
    showCurrentAccount()
  })

program
  .command('remove')
  .description('Remove an account by alias')
  .argument('<alias>', 'Account alias to remove')
  .action((alias) => {
    removeAccountCmd(alias)
  })

if (process.argv.length === 2) {
  program.parse(['node', 'shopify-acc', 'list'])
} else {
  program.parse()
}
