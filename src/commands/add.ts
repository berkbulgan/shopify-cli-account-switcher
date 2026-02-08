import chalk from 'chalk'
import { spawn } from 'child_process'

export function addAccount(): void {
  console.log(chalk.cyan('Starting authentication...'))
  console.log(chalk.gray('This will run "shopify auth login" to authenticate a new account.'))
  console.log()

  const shopifyAuth = spawn('shopify', ['auth', 'login'], {
    stdio: 'inherit',
    shell: true
  })

  shopifyAuth.on('close', (code) => {
    if (code === 0) {
      console.log()
      console.log(chalk.green('✓ Authentication successful!'))
      console.log(chalk.gray('Your account has been added to Shopify CLI.'))
      console.log()
      console.log(chalk.cyan('Use "shopify-acc list" to see all your accounts.'))
    } else {
      console.log()
      console.log(chalk.red('✗ Authentication failed.'))
      console.log(chalk.gray('Please try again or check your internet connection.'))
      process.exit(1)
    }
  })

  shopifyAuth.on('error', (error) => {
    console.log()
    console.log(chalk.red('✗ Error running shopify auth login:'), error.message)
    console.log(chalk.gray('Make sure Shopify CLI is installed: npm install -g @shopify/cli'))
    process.exit(1)
  })
}
