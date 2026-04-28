import ora from 'ora';
import inquirer from 'inquirer';
import { isLoggedIn } from '../auth';
import { createPayout } from '../api';
import { c, sectionHeader, errorBox, ok, err, warn, info, dim, printBanner } from '../ui';

export async function cmdPayout(options: { upi?: string; amount?: string }): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('Withdraw Earnings');

  console.log(c.dim('  Your 70% earnings are held until you request a payout.\n'));

  // Collect UPI ID
  let upiId = options.upi;
  if (!upiId) {
    const answer = await inquirer.prompt([{
      type: 'input',
      name: 'upi',
      message: '  UPI ID (e.g. yourname@upi):',
      validate: (v: string) => v.includes('@') || 'Enter a valid UPI ID like name@bank',
    }]);
    upiId = answer.upi;
  }

  // Collect amount
  let amount: number;
  if (options.amount) {
    amount = parseFloat(options.amount);
  } else {
    const answer = await inquirer.prompt([{
      type: 'number',
      name: 'amount',
      message: '  Amount to withdraw (₹):',
      default: 100,
      validate: (v: number) => v >= 10 || 'Minimum withdrawal is ₹10',
    }]);
    amount = answer.amount;
  }

  // Confirmation
  const confirm = await inquirer.prompt([{
    type: 'confirm',
    name: 'ok',
    message: `  Confirm payout of ₹${amount} to ${upiId}?`,
    default: false,
  }]);

  if (!confirm.ok) {
    warn('Payout cancelled.');
    return;
  }

  info(`Initiating payout of ₹${amount} to ${c.brand(upiId!)}...`);

  const spinner = ora({ text: 'Processing via Razorpay X...', color: 'cyan', indent: 2 }).start();
  const result = await createPayout(upiId!, amount * 100);
  spinner.stop();

  if (result.success) {
    ok(`Payout initiated: ₹${amount} → ${upiId}`);
    dim('  Funds arrive within 1-2 business days.');
    dim('  Track status: elabs sales');
  } else {
    err(`Payout failed: ${result.message}`);
    dim('  Ensure your UPI ID is valid and linked to a bank account.');
  }
  console.log('');
}
