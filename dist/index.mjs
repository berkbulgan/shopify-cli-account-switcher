#!/usr/bin/env node

// src/index.ts
import { Command } from "commander";

// src/commands/list.ts
import chalk from "chalk";

// src/lib/config.ts
import Conf from "conf";
var config = new Conf({
  projectName: "shopify-cli-kit"
});
function getSessions() {
  try {
    const sessionStore = config.get("sessionStore");
    if (!sessionStore) return {};
    return JSON.parse(sessionStore);
  } catch {
    return {};
  }
}
function setSessions(sessions) {
  config.set("sessionStore", JSON.stringify(sessions));
}
function getCurrentSessionId() {
  return config.get("currentSessionId");
}
function setCurrentSessionId(id) {
  config.set("currentSessionId", id);
}

// src/lib/session.ts
function getAllAccounts() {
  const sessions = getSessions();
  const currentSessionId = getCurrentSessionId();
  const accounts = [];
  for (const [fqdn, users] of Object.entries(sessions)) {
    for (const [userId, sessionData] of Object.entries(users)) {
      const alias = sessionData.identity.alias || userId;
      const stores = [];
      for (const [appId, appToken] of Object.entries(sessionData.applications)) {
        if (appToken.storeFqdn && !stores.includes(appToken.storeFqdn)) {
          stores.push(appToken.storeFqdn);
        }
      }
      accounts.push({
        alias,
        userId,
        fqdn,
        stores,
        isCurrent: currentSessionId === userId
      });
    }
  }
  return accounts;
}
function getAccountByAlias(alias) {
  const accounts = getAllAccounts();
  return accounts.find((acc) => acc.alias === alias);
}
function getAccountByIndex(index) {
  const accounts = getAllAccounts();
  if (index < 0 || index >= accounts.length) {
    return void 0;
  }
  return accounts[index];
}
function switchAccount(alias) {
  const account = getAccountByAlias(alias);
  if (!account) return false;
  setCurrentSessionId(account.userId);
  return true;
}
function removeAccount(alias) {
  const sessions = getSessions();
  const account = getAccountByAlias(alias);
  if (!account) return false;
  const { fqdn, userId } = account;
  delete sessions[fqdn][userId];
  if (Object.keys(sessions[fqdn]).length === 0) {
    delete sessions[fqdn];
  }
  setSessions(sessions);
  const currentSessionId = getCurrentSessionId();
  if (currentSessionId === userId) {
    setCurrentSessionId(getAllAccounts()[0]?.userId || "");
  }
  return true;
}
function getCurrentAccount() {
  const accounts = getAllAccounts();
  return accounts.find((acc) => acc.isCurrent);
}

// src/commands/list.ts
function listAccounts() {
  const accounts = getAllAccounts();
  if (accounts.length === 0) {
    console.log(chalk.yellow("No accounts found."));
    console.log(chalk.gray("Use Shopify CLI to login first: shopify auth login"));
    return;
  }
  console.log(chalk.bold.cyan("Accounts:"));
  console.log();
  for (const account of accounts) {
    console.log(`[${accounts.indexOf(account) + 1}] ${account.alias}`);
  }
  console.log();
  const currentAccount = getCurrentAccount();
  if (currentAccount) {
    console.log(chalk.green(`(*) Current account: ${currentAccount.alias}`));
  }
}

// src/commands/add.ts
import chalk2 from "chalk";
import { spawn } from "child_process";
function addAccount() {
  console.log(chalk2.cyan("Starting authentication..."));
  console.log(chalk2.gray('This will run "shopify auth login" to authenticate a new account.'));
  console.log();
  const shopifyAuth = spawn("shopify", ["auth", "login"], {
    stdio: "inherit",
    shell: true
  });
  shopifyAuth.on("close", (code) => {
    if (code === 0) {
      console.log();
      console.log(chalk2.green("\u2713 Authentication successful!"));
      console.log(chalk2.gray("Your account has been added to Shopify CLI."));
      console.log();
      console.log(chalk2.cyan('Use "shopify-acc list" to see all your accounts.'));
    } else {
      console.log();
      console.log(chalk2.red("\u2717 Authentication failed."));
      console.log(chalk2.gray("Please try again or check your internet connection."));
      process.exit(1);
    }
  });
  shopifyAuth.on("error", (error) => {
    console.log();
    console.log(chalk2.red("\u2717 Error running shopify auth login:"), error.message);
    console.log(chalk2.gray("Make sure Shopify CLI is installed: npm install -g @shopify/cli"));
    process.exit(1);
  });
}

// src/commands/switch.ts
import chalk3 from "chalk";
function switchToAccount(identifier) {
  const accounts = getAllAccounts();
  if (accounts.length === 0) {
    console.log(chalk3.red("Error: No accounts found."));
    console.log(chalk3.gray("Use Shopify CLI to login first: shopify auth login"));
    process.exit(1);
  }
  if (accounts.length === 1) {
    const success = switchAccount(accounts[0].alias);
    if (success) {
      console.log(chalk3.green(`\u2713 Switched to ${accounts[0].alias}`));
      console.log(chalk3.gray(`Stores: ${accounts[0].stores.join(", ") || "None"}`));
    }
    return;
  }
  if (!identifier) {
    console.log(chalk3.bold.cyan("Accounts:"));
    console.log();
    for (const account2 of accounts) {
      console.log(`[${accounts.indexOf(account2) + 1}] ${account2.alias}`);
    }
    console.log();
    const currentAccount = getCurrentAccount();
    if (currentAccount) {
      console.log(chalk3.green(`(*) Current account: ${currentAccount.alias}`));
    }
    return;
  }
  const num = parseInt(identifier);
  if (!isNaN(num)) {
    if (num < 1 || num > accounts.length) {
      console.log(chalk3.red(`Error: Account number ${num} is out of range.`));
      console.log(chalk3.gray(`Valid range: 1-${accounts.length}`));
      process.exit(1);
    }
    const account2 = getAccountByIndex(num - 1);
    if (account2) {
      const success = switchAccount(account2.alias);
      if (success) {
        console.log(chalk3.green(`\u2713 Switched to ${account2.alias} (Account #${num})`));
        console.log(chalk3.gray(`Stores: ${account2.stores.join(", ") || "None"}`));
      } else {
        console.log(chalk3.red("Error: Failed to switch account."));
        process.exit(1);
      }
    }
    return;
  }
  const account = getAccountByAlias(identifier);
  if (account) {
    const success = switchAccount(account.alias);
    if (success) {
      console.log(chalk3.green(`\u2713 Switched to ${account.alias}`));
      console.log(chalk3.gray(`Stores: ${account.stores.join(", ") || "None"}`));
    } else {
      console.log(chalk3.red("Error: Failed to switch account."));
      process.exit(1);
    }
  } else {
    console.log(chalk3.red(`Error: Account "${identifier}" not found.`));
    console.log(chalk3.gray('Use "shopify-acc list" to see available accounts.'));
    process.exit(1);
  }
}

// src/commands/current.ts
import chalk4 from "chalk";
function showCurrentAccount() {
  const account = getCurrentAccount();
  if (!account) {
    console.log(chalk4.yellow("No active account found."));
    console.log(chalk4.gray('Use "shopify-acc list" to see available accounts.'));
    console.log(chalk4.gray('Use "shopify-acc switch <alias>" to set an active account.'));
    return;
  }
  const sessions = getSessions();
  const sessionData = sessions[account.fqdn][account.userId];
  const expiresAt = new Date(sessionData.identity.expiresAt);
  const isValid = expiresAt > /* @__PURE__ */ new Date();
  console.log(chalk4.bold.cyan("Current Account:"));
  console.log();
  console.log(chalk4.green(`  Alias: ${account.alias}`));
  console.log(chalk4.gray(`  User ID: ${account.userId}`));
  console.log(chalk4.gray(`  FQDN: ${account.fqdn}`));
  console.log(chalk4.gray(`  Stores: ${account.stores.join(", ") || "None"}`));
  console.log(chalk4.gray(`  Expires: ${expiresAt.toLocaleString()}`));
  console.log(chalk4.gray(`  Status: ${isValid ? chalk4.green("Valid") : chalk4.red("Expired")}`));
}

// src/commands/remove.ts
import chalk5 from "chalk";
function removeAccountCmd(alias) {
  if (!alias) {
    console.log(chalk5.red("Error: Alias is required."));
    console.log(chalk5.gray("Usage: shopify-acc remove <alias>"));
    process.exit(1);
  }
  const account = getAccountByAlias(alias);
  if (!account) {
    console.log(chalk5.red(`Error: Account "${alias}" not found.`));
    console.log(chalk5.gray('Use "shopify-acc list" to see available accounts.'));
    process.exit(1);
  }
  const success = removeAccount(alias);
  if (success) {
    console.log(chalk5.green(`\u2713 Removed ${alias}`));
  } else {
    console.log(chalk5.red("Error: Failed to remove account."));
    process.exit(1);
  }
}

// src/index.ts
var program = new Command();
program.name("shopify-acc").description("Quickly switch between multiple Shopify CLI accounts without logout/login").version("1.0.0");
program.command("add").description("Add a new Shopify account (runs shopify auth login)").action(() => {
  addAccount();
});
program.command("list").description("List all Shopify CLI accounts").action(() => {
  listAccounts();
});
program.command("switch").description("Switch to a specific account (by number or alias)").argument("[identifier]", "Account number or alias to switch to").action((identifier) => {
  switchToAccount(identifier);
});
program.command("current").description("Show current active account").action(() => {
  showCurrentAccount();
});
program.command("remove").description("Remove an account by alias").argument("<alias>", "Account alias to remove").action((alias) => {
  removeAccountCmd(alias);
});
if (process.argv.length === 2) {
  program.parse(["node", "shopify-acc", "list"]);
} else {
  program.parse();
}
