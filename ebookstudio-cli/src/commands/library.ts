import ora from 'ora';
import inquirer from 'inquirer';
import { isLoggedIn } from '../auth';
import { getUserBooks, publishBook, BookStub } from '../api';
import { c, sectionHeader, errorBox, ok, err, info, dim, printBanner, printTable } from '../ui';

export async function cmdLibrary(): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('My Library');

  const spinner = ora({ text: 'Loading your ebooks...', color: 'cyan', indent: 2 }).start();
  const books = await getUserBooks();
  spinner.stop();

  if (books.length === 0) {
    console.log(c.dim('\n  No ebooks found in your library.\n'));
    dim('  Create one: elabs generate --topic "your topic"');
    dim('  Or visit: https://ebookstudio.vercel.app/ebookstudio');
    console.log('');
    return;
  }

  const drafts   = books.filter(b => b.isDraft);
  const published = books.filter(b => !b.isDraft);

  if (drafts.length > 0) {
    console.log('');
    console.log(c.warning.bold('  ◆ DRAFTS ') + c.dim(`(${drafts.length})`));
    printTable(
      ['ID (short)', 'Title', 'Genre', 'Pages'],
      drafts.map(b => [
        b.id.slice(-8),
        b.title.length > 40 ? b.title.slice(0, 37) + '...' : b.title,
        b.genre || '—',
        b.pages ? String(b.pages) : '—',
      ])
    );
  }

  if (published.length > 0) {
    console.log('');
    console.log(c.success.bold('  ◆ PUBLISHED ') + c.dim(`(${published.length})`));
    printTable(
      ['ID (short)', 'Title', 'Price', 'Genre'],
      published.map(b => [
        b.id.slice(-8),
        b.title.length > 40 ? b.title.slice(0, 37) + '...' : b.title,
        b.price === 0 ? 'Free' : `₹${(b.price / 100).toFixed(0)}`,
        b.genre || '—',
      ])
    );
  }

  console.log('');
  dim('  Commands: elabs publish --id <id>   elabs chat   elabs generate');
  console.log('');
}

export async function cmdPublish(options: { id?: string; price?: string; free?: boolean }): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('Publish Ebook');

  // Get book ID
  let bookId = options.id;
  if (!bookId) {
    const spinner = ora({ text: 'Loading your drafts...', color: 'cyan', indent: 2 }).start();
    const books = await getUserBooks();
    spinner.stop();

    const drafts = books.filter(b => b.isDraft);
    if (drafts.length === 0) {
      err('No draft ebooks found. Create one first: elabs generate');
      return;
    }

    const choices = drafts.map(b => ({
      name: `${b.title} (${b.id.slice(-8)})`,
      value: b.id,
    }));

    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'bookId',
      message: '  Select ebook to publish:',
      choices,
    }]);
    bookId = answer.bookId;
  }

  // Pricing
  let price = 0;
  if (options.free) {
    price = 0;
  } else if (options.price) {
    price = Math.round(parseFloat(options.price) * 100);
  } else {
    const answer = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '  Pricing model:',
        choices: [
          { name: 'Free (grow your audience)', value: 'free' },
          { name: 'Paid (earn revenue)', value: 'paid' },
        ],
      },
      {
        type: 'number',
        name: 'amount',
        message: '  Price in ₹:',
        default: 299,
        when: (ans: any) => ans.type === 'paid',
        validate: (v: number) => v >= 10 || 'Minimum ₹10',
      },
    ]);
    price = answer.type === 'free' ? 0 : Math.round((answer.amount || 299) * 100);
  }

  const priceDisplay = price === 0 ? 'Free' : `₹${(price / 100).toFixed(0)}`;
  info(`Publishing at ${c.brand(priceDisplay)}...`);

  const spinner = ora({ text: 'Publishing to marketplace...', color: 'cyan', indent: 2 }).start();
  const success = await publishBook(bookId!, price);
  spinner.stop();

  if (success) {
    ok(`Published successfully at ${priceDisplay}!`);
    dim('  Your ebook is now live on https://ebookstudio.vercel.app/store');
    if (price > 0) {
      const earn = (price / 100 * 0.7).toFixed(2);
      dim(`  You earn ₹${earn} per sale (70% split)`);
    }
  } else {
    err('Publish failed. Check your connection or try from the browser.');
  }
  console.log('');
}
