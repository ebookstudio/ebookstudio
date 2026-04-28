#!/usr/bin/env node
import { Command } from 'commander';
import { CLI_VERSION } from './config';
import { printBanner, c } from './ui';
import { cmdLogin, cmdLogout, cmdWhoami } from './commands/login';
import { cmdChat } from './commands/chat';
import { cmdGenerate } from './commands/generate';
import { cmdLibrary, cmdPublish } from './commands/library';
import { cmdSales } from './commands/sales';
import { cmdPayout } from './commands/payout';

const program = new Command();

program
  .name('ebookstudio')
  .description('EbookStudio CLI — AI-powered ebook creation from your terminal')
  .version(CLI_VERSION)
  .addHelpText('after', `
${c.brand.bold('Examples:')}
  ${c.dim('$')} ebookstudio login
  ${c.dim('$')} ebookstudio chat
  ${c.dim('$')} ebookstudio generate --topic "Quantum Computing for Beginners"
  ${c.dim('$')} ebookstudio generate --topic "..." --output book.json
  ${c.dim('$')} ebookstudio library
  ${c.dim('$')} ebookstudio publish --price 299
  ${c.dim('$')} ebookstudio sales
  ${c.dim('$')} ebookstudio payout --upi yourname@upi --amount 500

${c.brand.bold('Browser:')}
  ${c.dim('→')} https://ebookstudio.vercel.app — same account, all features
`);

// ─── Auth commands ────────────────────────────────────────────────────────────
program
  .command('login')
  .description('Sign in to your EbookStudio account')
  .action(() => cmdLogin());

program
  .command('logout')
  .description('Sign out of your account')
  .action(() => cmdLogout());

program
  .command('whoami')
  .description('Show your current account info')
  .action(() => cmdWhoami());

// ─── AI commands ──────────────────────────────────────────────────────────────
program
  .command('chat')
  .description('Interactive AI Co-Author chat session')
  .option('-p, --prompt <text>', 'Send a single prompt (non-interactive)')
  .action((opts) => cmdChat(opts));

program
  .command('generate')
  .description('Generate a complete ebook structure from a topic')
  .option('-t, --topic <text>', 'Ebook topic or full prompt')
  .option('-o, --output <file>', 'Save structure to JSON file')
  .option('-s, --save', 'Save to current directory')
  .action((opts) => cmdGenerate(opts));

// ─── Library commands ─────────────────────────────────────────────────────────
program
  .command('library')
  .alias('ls')
  .description('View your ebook library (drafts + published)')
  .action(() => cmdLibrary());

program
  .command('publish')
  .description('Publish an ebook draft to the marketplace')
  .option('-i, --id <bookId>', 'Book ID to publish')
  .option('-p, --price <amount>', 'Price in ₹ (e.g. 299)')
  .option('-f, --free', 'Publish for free')
  .action((opts) => cmdPublish(opts));

// ─── Revenue commands ─────────────────────────────────────────────────────────
program
  .command('sales')
  .description('View your sales history and earnings')
  .action(() => cmdSales());

program
  .command('payout')
  .description('Withdraw your earnings via UPI (Razorpay X)')
  .option('-u, --upi <id>', 'UPI ID (e.g. yourname@upi)')
  .option('-a, --amount <₹>', 'Amount to withdraw in ₹')
  .action((opts) => cmdPayout(opts));

// ─── Default (no command) ─────────────────────────────────────────────────────
program
  .command('studio', { isDefault: false })
  .description('Open the web studio in your browser')
  .action(() => {
    const open = require('child_process').exec;
    const url = 'https://ebookstudio.vercel.app/ebookstudio';
    const cmd = process.platform === 'darwin' ? `open ${url}`
              : process.platform === 'win32'  ? `start ${url}`
              : `xdg-open ${url}`;
    open(cmd);
    console.log(c.brand(`  → Opening ${url}`));
  });

// Show banner if no args
if (process.argv.length === 2) {
  printBanner();
  console.log(c.muted('  Run ') + c.brand('elabs --help') + c.muted(' to see all commands.\n'));
  program.outputHelp();
} else {
  program.parse(process.argv);
}
