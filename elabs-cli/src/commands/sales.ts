import ora from 'ora';
import { isLoggedIn } from '../auth';
import { getSales, SaleRecord } from '../api';
import { c, sectionHeader, errorBox, dim, printBanner, printTable, infoBox } from '../ui';

export async function cmdSales(): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('Sales & Earnings');

  const spinner = ora({ text: 'Fetching your sales data...', color: 'cyan', indent: 2 }).start();
  const sales = await getSales();
  spinner.stop();

  if (sales.length === 0) {
    console.log('');
    dim('  No sales yet. Publish your first ebook: elabs publish');
    dim('  Or view your drafts: elabs library');
    console.log('');

    // Show encouragement stats
    infoBox('Revenue Potential', [
      `${c.muted('Target:')} 1,000 writers × ₹499/mo = ₹4.99L MRR`,
      `${c.muted('Your cut:')} 70% of every sale`,
      '',
      `${c.brand('→')} Publish your first ebook today to start earning`,
    ]);
    return;
  }

  // Calculate totals
  const totalRevenue = sales.reduce((s, sale) => s + sale.amount, 0);
  const yourEarnings = totalRevenue * 0.7;
  const completedSales = sales.filter(s => s.status === 'completed');

  console.log('');
  console.log(c.brand.bold(`  ₹${yourEarnings.toFixed(2)} `) + c.muted('your earnings'));
  console.log(c.dim(`  ₹${totalRevenue.toFixed(2)} gross · ${completedSales.length} completed sales`));
  console.log('');

  // Table of recent sales
  sectionHeader('Recent Sales');
  printTable(
    ['Date', 'Book', 'Amount', 'Status'],
    sales.slice(0, 20).map(s => [
      new Date(s.timestamp).toLocaleDateString('en-IN'),
      s.bookTitle.length > 30 ? s.bookTitle.slice(0, 27) + '...' : s.bookTitle,
      `₹${(s.amount / 100).toFixed(2)}`,
      s.status === 'completed' ? '✓ paid' : s.status,
    ])
  );

  if (sales.length > 20) {
    dim(`  Showing 20 of ${sales.length} sales. Visit the dashboard for full history.`);
  }
  console.log('');
  dim(`  Withdraw earnings: elabs payout --upi yourname@bank`);
  console.log('');
}
