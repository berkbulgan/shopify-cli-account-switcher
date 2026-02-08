# Shopify CLI Account Switcher

Quickly switch between multiple Shopify CLI accounts without logout/login.

## 🎯 Problem Solved

Shopify CLI requires you to log out and log back in every time you want to switch between different accounts. This is time-consuming and inefficient.

**Solution:** This tool allows you to switch between multiple Shopify CLI accounts instantly by manipulating the `currentSessionId` in Shopify CLI's configuration file.

## 🏗️ How It Works

### Technical Architecture

```
┌─────────────────────────────────────────────┐
│  Shopify CLI Config File                  │
│  (via Conf package)                  │
│                                         │
│  projectName: 'shopify-cli-kit'        │
│  Config Path:                          │
│    Windows: %APPDATA%\Roaming\shopify-cli-kit-nodejs\Config\config.json
│    macOS:   ~/Library/Application Support/shopify-cli-kit-nodejs/Config/
│    Linux:   ~/.config/shopify-cli-kit-nodejs/Config/  │
│                                         │
│  Key Fields:                            │
│  - sessionStore (JSON string)           │
│  - currentSessionId (string)             │
└─────────────────────────────────────────────┘
```

### Session Storage Format

```json
{
  "sessionStore": "{\"accounts.shopify.com\":{\"66e7601e-09b8-4245-ae12-f7968ce6b28a\":{...}}}",
  "currentSessionId": "66e7601e-09b8-4245-ae12-f7968ce6b28a"
}
```

### Switching Mechanism

```
Before:
  currentSessionId: "user1@example.com"

After (switch to user2):
  currentSessionId: "user2@example.com"

No other config changes - Shopify CLI now thinks user2@example.com is the active user
```

### Security Model

✅ **What This Tool DOES:**
- Reads Shopify CLI's config file
- Modifies `currentSessionId` field
- Displays account information (alias, stores, expiration)

✅ **What This Tool DOES NOT:**
- Access or read authentication tokens
- Modify any session data
- Store credentials
- Create new sessions
- Interfere with Shopify CLI's authentication flow

🔒 **Security Guarantee:**
- Token access: **NO**
- Token storage: **NO**
- Token transmission: **NO**
- Session modification: **NO** (only ID pointer change)

## 📦 Installation

### Prerequisites

- **Node.js:** 18.0.0 or higher
- **Shopify CLI:** Must be installed first
  ```bash
  npm install -g @shopify/cli
  ```

### Install This Tool

```bash
npm install -g shopify-account-switcher
```

Or locally for development:
```bash
git clone https://github.com/username/shopify-cli-account-switcher.git
cd shopify-cli-account-switcher
npm install
npm run build
npm link
```

## 💻 Usage

### List All Accounts

```bash
shopify-acc list
```

Example output:
```
Accounts:

[1] john@example.com
[2] jane@example.com
[3] developer@agency.com

(*) Current account: jane@example.com
```

**Display Format:**
- Numbered list: `[1]`, `[2]`, `[3]`, etc.
- Current account indicator: `(*)` appears at end with account alias
- Each line shows account alias

### Switch Account

#### By Number

```bash
shopify-acc switch 1
```

Output:
```
✓ Switched to john@example.com (Account #1)
Stores: mystore.myshopify.com
```

#### By Alias (Email)

```bash
shopify-acc switch jane@example.com
```

Output:
```
✓ Switched to jane@example.com
Stores: store1.myshopify.com, store2.myshopify.com

```

#### No Arguments - Shows Numbered List

```bash
shopify-acc switch
```

Output:
```
Accounts:

[1] john@example.com
[2] jane@example.com
[3] developer@agency.com

(*) Current account: jane@example.com
```

**Note:** When no arguments provided, `shopify-acc switch` displays the same numbered list as `shopify-acc list` so you can see all available accounts and their numbers.

### Show Current Account

```bash
shopify-acc current
```

Example output:
```
Current Account:

  Alias: jane@example.com
  User ID: 66e7601e-09b8-4245-ae12-f7968ce6b28a
  FQDN: accounts.shopify.com
  Stores: store1.myshopify.com, store2.myshopify.com
  Expires: 2/15/2026, 3:45:00 PM
  Status: Valid
```

### Add New Account

```bash
shopify-acc add
```

Output:
```
Starting authentication...
This will run "shopify auth login" to authenticate a new account.

[Shopify CLI will open browser for authentication...]

✓ Authentication successful!
Your account has been added to Shopify CLI.

Use "shopify-acc list" to see all your accounts.
```

**Note:** This command simply runs `shopify auth login` which handles the entire browser-based OAuth flow securely.

### Remove Account

```bash
shopify-acc remove jane@example.com
```

Output:
```
✓ Removed jane@example.com
```

## 🔄 Numbered List & Switching Feature

### Display Format

```bash
shopify-acc list
```

```
Accounts:

[1] john@example.com
[2] jane@example.com
[3] developer@agency.com

(*) Current account: jane@example.com
```

**Key Points:**
- Each account has a number: `[1]`, `[2]`, `[3]`
- Current account shown at end: `(*) Current account: jane@example.com`
- You can switch by either number or alias

### Switching Priority

The `switch` command tries alias **first**, then checks for numbers:

```typescript
// Priority: alias → number
if (identifier isNumeric) {
  // Treat as index (convert 1-based)
  const account = accounts[number - 1]
} else {
  // Treat as alias
  const account = accounts.find(a => a.alias === identifier)
}
```

### Examples

```bash
# Switch by number
shopify-acc switch 1

# Switch by alias (email)
shopify-acc switch john@example.com

# Show numbered list (same as list)
shopify-acc switch
```

### Single Account Scenario

When only one account exists:
```bash
shopify-acc switch
```

Auto-switches to the only account (no list displayed, no selection needed).

## 🛠️ Troubleshooting

### "No accounts found"

**Problem:** No Shopify CLI accounts configured on your system.

**Solution:**
```bash
# Login to Shopify CLI first
shopify auth login

# Then list accounts
shopify-acc list
```

### "Account not found"

**Problem:** The provided number or alias doesn't exist.

**Solution:**
```bash
# List all available accounts with numbers
shopify-acc list

# Use the exact number or alias shown in the list
shopify-acc switch 2
# or
shopify-acc switch jane@example.com
```

### "Account number X is out of range"

**Problem:** Number provided is outside valid range.

**Solution:**
```bash
# List accounts to see valid range
shopify-acc list

# If you see [1], [2], [3], only numbers 1-3 are valid
shopify-acc switch 4  # ❌ Invalid
shopify-acc switch 3  # ✅ Valid
```

### Session Expired

**Problem:** Session has expired and is no longer valid.

**Solution:**
```bash
# Re-authenticate the specific account
shopify acc switch <alias>

# Or manually with Shopify CLI
shopify auth login
```

### Config File Not Found

**Problem:** `Error: Config file not found`

**Possible Causes:**
1. Shopify CLI has never been run
2. Different Shopify CLI version installed
3. Custom config location

**Solution:**
```bash
# Ensure Shopify CLI is installed and has been used
npm list -g @shopify/cli
shopify --version

# Run Shopify CLI once to create config
shopify auth --help
shopify auth login

# Then try this tool again
shopify-acc list
```

### Permission Denied

**Problem:** Cannot access or modify config file.

**Solution:**
```bash
# Windows: Run terminal as Administrator
# macOS/Linux: Fix file permissions
chmod u+rw ~/.config/shopify-cli-kit-nodejs/
```

## 📂 File Structure

```
shopify-cli-account-switcher/
├── package.json
├── tsconfig.json
├── README.md
├── LICENSE
├── .gitignore
├── src/
│   ├── lib/
│   │   ├── config.ts          # Config storage (Conf package)
│   │   ├── session.ts         # Session operations + getAccountByIndex, switchAccountByIndex
│   │   └── types.ts           # TypeScript interfaces
│   ├── commands/
│   │   ├── list.ts            # Numbered list display [1] user@example.com
│   │   ├── switch.ts          # Number/alias switching
│   │   ├── add.ts             # Runs shopify auth login
│   │   ├── current.ts          # Shows current account details
│   │   └── remove.ts          # Removes account
│   └── index.ts              # CLI entry point
└── bin/
    └── shopify-acc            # Executable script
```

## 🔐 Security Considerations

### What's Secure

✅ **No Token Access:** Tool never reads or stores authentication tokens
✅ **No Credential Storage:** All credentials remain in Shopify CLI's secure storage
✅ **Minimal Modifications:** Only changes `currentSessionId` pointer
✅ **No Network Access:** Tool operates locally on filesystem only
✅ **Shopify CLI Handles Auth:** `shopify-acc add` delegates to `shopify auth login`

### What's Not Stored

❌ **Tokens:** No access or storage of any authentication tokens
❌ **Passwords:** No password storage
❌ **Cookies:** No cookie handling
❌ **API Keys:** No API key storage

### Attack Vector Protection

🛡️ **Token Hijacking:** Impossible - tool never accesses tokens
🛡️ **Credential Theft:** Impossible - tool never reads credentials
🛡️ **Session Elevation:** Impossible - no session modification capability
🛡️ **Replay Attacks:** Impossible - only pointer change, no token access

## 📊 Platform-Specific Details

### Windows
```
Config Path: %APPDATA%\shopify-cli-kit-nodejs\Config\config.json

Example: C:\Users\username\AppData\Roaming\shopify-cli-kit-nodejs\Config\config.json
```

### macOS
```
Config Path: ~/Library/Application Support/shopify-cli-kit-nodejs/Config/

Example: /Users/username/Library/Application Support/shopify-cli-kit-nodejs/Config/config.json
```

### Linux
```
Config Path: ~/.config/shopify-cli-cli-kit-nodejs/

Example: /home/username/.config/shopify-cli-kit-nodejs/config.json
```

## 🚀 Development

### Build
```bash
npm run build
```

### Local Installation
```bash
npm link
shopify-acc list
```

### Project Structure
- TypeScript
- ES Modules (.mjs) + CommonJS (.js) dual format
- Minimal dependencies (conf, chalk, commander)

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup
```bash
git clone https://github.com/username/shopify-cli-account-switcher.git
cd shopify-cli-account-switcher
npm install
npm run build
npm link
```

### Code Style
- TypeScript strict mode enabled
- ESLint recommended
- Follow Shopify CLI conventions

## 🎓 Use Cases

### Multiple Agency Accounts
```bash
# Developer works with 3 different clients
shopify-acc list
shopify-acc switch 1  # client-a
shopify-acc switch 2  # client-b
shopify app dev     # Works on client-a project
```

### Team Collaboration
```bash
# Multiple developers share same machine
shopify-acc switch developer-a
shopify-acc list
# ...work on personal project...
shopify acc switch developer-b
# ...switch to team project...
```

### Store Management
```bash
# Manage multiple stores across different accounts
shopify-acc switch store-admin@example.com
shopify app push
shopify-acc switch another-store@example.com
shopify app serve
```

---

**Note:** This tool is not affiliated with or endorsed by Shopify. It's a utility for developers working with multiple Shopify CLI accounts.
