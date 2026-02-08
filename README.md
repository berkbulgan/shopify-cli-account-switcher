# Shopify CLI Account Switcher

Quickly switch between multiple Shopify CLI accounts without logout/login.

## Installation

```bash
npm install -g shopify-account-switcher
```

## Usage

### Add account

```bash
shopify-acc add
```

This command runs `shopify auth login` and opens the browser for authentication. Shopify CLI handles the entire authentication flow securely.

Example output:
```
Starting authentication...
This will run "shopify auth login" to authenticate a new account.

[Shopify CLI auth output...]

✓ Authentication successful!
Your account has been added to Shopify CLI.

Use "shopify-acc list" to see all your accounts.
```

### List all accounts

```bash
shopify-acc list
```

Example output:
```
Accounts:

[1] john@example.com
[2] jane@example.com
[3] user3@example.com

(*) Current account: jane@example.com
```

### Switch account

```bash
# No arguments - shows numbered list
shopify-acc switch

# Switch by number
shopify-acc switch 2

# Switch by alias
shopify-acc switch jane@example.com
```

Examples:

No arguments:
```bash
shopify-acc switch
```
Output:
```
Accounts:

[1] john@example.com
[2] jane@example.com
[3] user3@example.com

(*) Current account: jane@example.com
```

Switch by number:
```bash
shopify-acc switch 1
```
Output:
```
✓ Switched to john@example.com (Account #1)
Stores: mystore.myshopify.com
```

Switch by alias:
```bash
shopify-acc switch jane@example.com
```
Output:
```
✓ Switched to jane@example.com
Stores: store1.myshopify.com, store2.myshopify.com
```

### Show current account

```bash
shopify-acc current
```

Example output:
```
Current Account:

  Alias: jane@example.com
  User ID: jane@example.com
  FQDN: accounts.shopify.com
  Stores: store1.myshopify.com, store2.myshopify.com
  Expires: 2/15/2026, 3:45:00 PM
  Status: Valid
```

### Remove account

```bash
shopify-acc remove <alias>
```

Example:
```bash
shopify-acc remove john@example.com
```

Output:
```
✓ Removed john@example.com
```

## How it works

This tool manipulates Shopify CLI's `currentSessionId` in its config file without accessing or modifying any authentication tokens directly. It only changes which session is marked as active.

## Security

- **Does NOT access or store tokens**
- **Only manipulates session IDs**
- **Requires existing Shopify CLI authentication**
- **Reads from Shopify CLI's own config file**

## Prerequisites

- Node.js 18.0.0 or higher
- Shopify CLI installed

To install Shopify CLI:
```bash
npm install -g @shopify/cli
```

## Troubleshooting

### "No accounts found"

Make sure you have at least one account logged in via Shopify CLI:
```bash
shopify auth login
```

Then use `shopify-acc list` to see all your accounts.

### "Account not found"

Use `shopify-acc list` to see all available accounts and their numbers or aliases.

### Session expired

If a session is expired, use Shopify CLI to re-authenticate:
```bash
shopify auth login
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
