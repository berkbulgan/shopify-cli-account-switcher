#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");

// src/commands/list.ts
var import_chalk = __toESM(require("chalk"));

// src/lib/config.ts
var import_conf = __toESM(require("conf"));
var config = new import_conf.default({
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
    console.log(import_chalk.default.yellow("No accounts found."));
    console.log(import_chalk.default.gray("Use Shopify CLI to login first: shopify auth login"));
    return;
  }
  console.log(import_chalk.default.bold.cyan("Accounts:"));
  console.log();
  for (const account of accounts) {
    console.log(`[${accounts.indexOf(account) + 1}] ${account.alias}`);
  }
  console.log();
  const currentAccount = getCurrentAccount();
  if (currentAccount) {
    console.log(import_chalk.default.green(`(*) Current account: ${currentAccount.alias}`));
  }
}

// src/commands/add.ts
var import_chalk2 = __toESM(require("chalk"));
var import_child_process = require("child_process");
function addAccount() {
  console.log(import_chalk2.default.cyan("Starting authentication..."));
  console.log(import_chalk2.default.gray('This will run "shopify auth login" to authenticate a new account.'));
  console.log();
  const shopifyAuth = (0, import_child_process.spawn)("shopify", ["auth", "login"], {
    stdio: "inherit",
    shell: true
  });
  shopifyAuth.on("close", (code) => {
    if (code === 0) {
      console.log();
      console.log(import_chalk2.default.green("\u2713 Authentication successful!"));
      console.log(import_chalk2.default.gray("Your account has been added to Shopify CLI."));
      console.log();
      console.log(import_chalk2.default.cyan('Use "shopify-acc list" to see all your accounts.'));
    } else {
      console.log();
      console.log(import_chalk2.default.red("\u2717 Authentication failed."));
      console.log(import_chalk2.default.gray("Please try again or check your internet connection."));
      process.exit(1);
    }
  });
  shopifyAuth.on("error", (error) => {
    console.log();
    console.log(import_chalk2.default.red("\u2717 Error running shopify auth login:"), error.message);
    console.log(import_chalk2.default.gray("Make sure Shopify CLI is installed: npm install -g @shopify/cli"));
    process.exit(1);
  });
}

// src/commands/switch.ts
var import_chalk3 = __toESM(require("chalk"));
function switchToAccount(identifier) {
  const accounts = getAllAccounts();
  if (accounts.length === 0) {
    console.log(import_chalk3.default.red("Error: No accounts found."));
    console.log(import_chalk3.default.gray("Use Shopify CLI to login first: shopify auth login"));
    process.exit(1);
  }
  if (accounts.length === 1) {
    const success = switchAccount(accounts[0].alias);
    if (success) {
      console.log(import_chalk3.default.green(`\u2713 Switched to ${accounts[0].alias}`));
      console.log(import_chalk3.default.gray(`Stores: ${accounts[0].stores.join(", ") || "None"}`));
    }
    return;
  }
  if (!identifier) {
    console.log(import_chalk3.default.bold.cyan("Accounts:"));
    console.log();
    for (const account2 of accounts) {
      console.log(`[${accounts.indexOf(account2) + 1}] ${account2.alias}`);
    }
    console.log();
    const currentAccount = getCurrentAccount();
    if (currentAccount) {
      console.log(import_chalk3.default.green(`(*) Current account: ${currentAccount.alias}`));
    }
    return;
  }
  const num = parseInt(identifier);
  if (!isNaN(num)) {
    if (num < 1 || num > accounts.length) {
      console.log(import_chalk3.default.red(`Error: Account number ${num} is out of range.`));
      console.log(import_chalk3.default.gray(`Valid range: 1-${accounts.length}`));
      process.exit(1);
    }
    const account2 = getAccountByIndex(num - 1);
    if (account2) {
      const success = switchAccount(account2.alias);
      if (success) {
        console.log(import_chalk3.default.green(`\u2713 Switched to ${account2.alias} (Account #${num})`));
        console.log(import_chalk3.default.gray(`Stores: ${account2.stores.join(", ") || "None"}`));
      } else {
        console.log(import_chalk3.default.red("Error: Failed to switch account."));
        process.exit(1);
      }
    }
    return;
  }
  const account = getAccountByAlias(identifier);
  if (account) {
    const success = switchAccount(account.alias);
    if (success) {
      console.log(import_chalk3.default.green(`\u2713 Switched to ${account.alias}`));
      console.log(import_chalk3.default.gray(`Stores: ${account.stores.join(", ") || "None"}`));
    } else {
      console.log(import_chalk3.default.red("Error: Failed to switch account."));
      process.exit(1);
    }
  } else {
    console.log(import_chalk3.default.red(`Error: Account "${identifier}" not found.`));
    console.log(import_chalk3.default.gray('Use "shopify-acc list" to see available accounts.'));
    process.exit(1);
  }
}

// src/commands/current.ts
var import_chalk4 = __toESM(require("chalk"));
function showCurrentAccount() {
  const account = getCurrentAccount();
  if (!account) {
    console.log(import_chalk4.default.yellow("No active account found."));
    console.log(import_chalk4.default.gray('Use "shopify-acc list" to see available accounts.'));
    console.log(import_chalk4.default.gray('Use "shopify-acc switch <alias>" to set an active account.'));
    return;
  }
  const sessions = getSessions();
  const sessionData = sessions[account.fqdn][account.userId];
  const expiresAt = new Date(sessionData.identity.expiresAt);
  const isValid = expiresAt > /* @__PURE__ */ new Date();
  console.log(import_chalk4.default.bold.cyan("Current Account:"));
  console.log();
  console.log(import_chalk4.default.green(`  Alias: ${account.alias}`));
  console.log(import_chalk4.default.gray(`  User ID: ${account.userId}`));
  console.log(import_chalk4.default.gray(`  FQDN: ${account.fqdn}`));
  console.log(import_chalk4.default.gray(`  Stores: ${account.stores.join(", ") || "None"}`));
  console.log(import_chalk4.default.gray(`  Expires: ${expiresAt.toLocaleString()}`));
  console.log(import_chalk4.default.gray(`  Status: ${isValid ? import_chalk4.default.green("Valid") : import_chalk4.default.red("Expired")}`));
}

// src/commands/remove.ts
var import_chalk5 = __toESM(require("chalk"));
function removeAccountCmd(alias) {
  if (!alias) {
    console.log(import_chalk5.default.red("Error: Alias is required."));
    console.log(import_chalk5.default.gray("Usage: shopify-acc remove <alias>"));
    process.exit(1);
  }
  const account = getAccountByAlias(alias);
  if (!account) {
    console.log(import_chalk5.default.red(`Error: Account "${alias}" not found.`));
    console.log(import_chalk5.default.gray('Use "shopify-acc list" to see available accounts.'));
    process.exit(1);
  }
  const success = removeAccount(alias);
  if (success) {
    console.log(import_chalk5.default.green(`\u2713 Removed ${alias}`));
  } else {
    console.log(import_chalk5.default.red("Error: Failed to remove account."));
    process.exit(1);
  }
}

// src/index.ts
var program = new import_commander.Command();
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
