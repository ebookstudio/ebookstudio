import readline from 'readline';
import inquirer from 'inquirer';
import { isLoggedIn } from '../auth';
import { streamChat } from '../api';
import { c, sectionHeader, errorBox, dim, printBanner } from '../ui';

interface Message { role: 'user' | 'assistant'; content: string }

export async function cmdChat(options: { prompt?: string }): Promise<void> {
  if (!isLoggedIn()) { errorBox('Not logged in. Run: elabs login'); return; }

  printBanner();
  sectionHeader('Co-Author Chat');
  console.log(c.dim('  Type your message and press Enter. Type "exit" or Ctrl+C to quit.\n'));

  const history: Message[] = [];

  const handleTurn = async (userMessage: string): Promise<void> => {
    history.push({ role: 'user', content: userMessage });

    process.stdout.write('\n' + c.brand('  ◆ Co-Author: '));

    let assistantText = '';
    const pageCards: Array<{ pageNumber: number; title: string; estimatedWords: number }> = [];

    try {
      await streamChat(
        history,
        (chunk) => {
          process.stdout.write(c.text(chunk));
          assistantText += chunk;
        },
        (tool) => {
          if (tool.toolName === 'plan_page' && tool.args) {
            pageCards.push({
              pageNumber: tool.args.pageNumber,
              title: tool.args.title,
              estimatedWords: tool.args.estimatedWords,
            });
          }
        }
      );
    } catch (err: any) {
      process.stdout.write('\n');
      console.log(c.error(`\n  Error: ${err.message}`));
      return;
    }

    process.stdout.write('\n');

    // Show planned pages if any tool calls came through
    if (pageCards.length > 0) {
      console.log('');
      console.log(c.brand(`  ◆ Book Structure (${pageCards.length} pages planned)`));
      for (const card of pageCards) {
        console.log(
          c.dim(`  ${String(card.pageNumber).padStart(2, '0')}`) +
          c.text(` ${card.title}`) +
          c.dim(` (~${card.estimatedWords}w)`)
        );
      }
    }

    history.push({ role: 'assistant', content: assistantText });
    console.log('');
  };

  // Non-interactive: single prompt from --prompt flag
  if (options.prompt) {
    console.log(c.muted('  You: ') + c.text(options.prompt));
    await handleTurn(options.prompt);
    return;
  }

  // Interactive REPL mode
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  const askQuestion = (): void => {
    rl.question(c.muted('  You: '), async (input: string) => {
      const trimmed = input.trim();
      if (!trimmed || trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(c.dim('\n  Session ended. Your ebooks are saved to your library.\n'));
        rl.close();
        return;
      }
      await handleTurn(trimmed);
      askQuestion();
    });
  };

  askQuestion();
}
