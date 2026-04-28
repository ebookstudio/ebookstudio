import ora from 'ora';
import * as fs from 'fs';
import * as path from 'path';
import { isLoggedIn, getSession } from '../auth';
import { streamChat } from '../api';
import { c, sectionHeader, errorBox, ok, info, dim, printBanner, printTable } from '../ui';

interface PageCard {
  pageNumber: number;
  title: string;
  summary: string;
  estimatedWords: number;
}

export async function cmdGenerate(options: {
  topic?: string;
  output?: string;
  save?: boolean;
}): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('Ebook Generation');

  const topic = options.topic || 'Write a complete ebook on a compelling topic of your choice';
  info(`Topic: ${c.brand(topic)}`);
  console.log('');

  const prompt = `${topic}

Please plan a complete, commercially-quality ebook structure with:
- Title page, Table of Contents, Introduction
- 6-8 chapters (specific to the topic above)
- Conclusion, About the Author, Appendix
- Each chapter: ~1000-1200 words, engaging and specific

Generate the full structure now.`;

  const pageCards: PageCard[] = [];
  let assistantText = '';

  const spinner = ora({ text: 'Co-Author is planning your ebook structure...', color: 'cyan', indent: 2 }).start();

  try {
    await streamChat(
      [{ role: 'user', content: prompt }],
      (chunk) => { assistantText += chunk; },
      (tool) => {
        if (tool.toolName === 'plan_page' && tool.args) {
          pageCards.push({
            pageNumber: tool.args.pageNumber,
            title: tool.args.title,
            summary: tool.args.summary,
            estimatedWords: tool.args.estimatedWords,
          });
          spinner.text = `Planning structure... (${pageCards.length} pages)`;
        }
      }
    );
  } catch (err: any) {
    spinner.fail('Generation failed: ' + err.message);
    return;
  }

  spinner.succeed(`Structure complete — ${pageCards.length} pages planned`);
  console.log('');

  // Show AI response
  if (assistantText.trim()) {
    console.log(c.brand('  ◆ Co-Author says:'));
    console.log(c.text(assistantText.trim().split('\n').map(l => '  ' + l).join('\n')));
    console.log('');
  }

  // Show book structure table
  if (pageCards.length > 0) {
    sectionHeader(`Book Structure (${pageCards.length} pages)`);
    printTable(
      ['#', 'Title', '~Words'],
      pageCards.map(c => [
        String(c.pageNumber).padStart(2, '0'),
        c.title.length > 50 ? c.title.slice(0, 47) + '...' : c.title,
        `~${c.estimatedWords}`,
      ])
    );

    const totalWords = pageCards.reduce((s, c) => s + c.estimatedWords, 0);
    console.log('');
    dim(`  Total estimated: ~${totalWords.toLocaleString()} words`);
    console.log('');
  }

  // Save output if requested
  if (options.output || options.save) {
    const session = getSession();
    const outFile = options.output || `ebook-${Date.now()}.json`;
    const outPath = path.resolve(process.cwd(), outFile);
    const data = {
      generatedAt: new Date().toISOString(),
      author: session?.name || 'Unknown',
      topic,
      structure: pageCards,
      aiMessage: assistantText,
    };
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf-8');
    ok(`Saved to ${outPath}`);
  }

  console.log(c.dim('  Next steps:'));
  console.log(c.dim('    elabs chat   — generate content for each chapter'));
  console.log(c.dim('    elabs library — view your saved drafts'));
  console.log(c.dim('    Visit https://ebookstudio.vercel.app to write full pages in the browser'));
  console.log('');
}
