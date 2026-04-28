import chalk from 'chalk';
import boxen from 'boxen';
import gradient from 'gradient-string';
import figlet from 'figlet';

// ─── Color palette ────────────────────────────────────────────────────────────
export const c = {
  brand:    chalk.hex('#818cf8'),   // indigo
  dim:      chalk.hex('#52525b'),   // zinc-600
  muted:    chalk.hex('#71717a'),   // zinc-500
  text:     chalk.hex('#e4e4e7'),   // zinc-200
  success:  chalk.hex('#34d399'),   // emerald-400
  warning:  chalk.hex('#fbbf24'),   // amber-400
  error:    chalk.hex('#f87171'),   // red-400
  blue:     chalk.hex('#60a5fa'),   // blue-400
  bold:     chalk.bold,
  faint:    chalk.dim,
};

// ─── Branding ─────────────────────────────────────────────────────────────────
export function printBanner(): void {
  const art = figlet.textSync('EbookStudio', {
    font: 'Standard',
    horizontalLayout: 'default',
  });
  console.log(gradient(['#818cf8', '#6366f1', '#4f46e5'])(art));
  console.log(c.dim('  AI-powered publishing platform for the next generation'));
  console.log(c.dim('  ──────────────────────────────────────────────────────\n'));
}

// ─── Styled boxes ─────────────────────────────────────────────────────────────
export function successBox(msg: string): void {
  console.log(boxen(c.success(msg), {
    padding: { left: 2, right: 2, top: 0, bottom: 0 },
    borderStyle: 'round',
    borderColor: 'green',
  }));
}

export function errorBox(msg: string): void {
  console.log(boxen(c.error(msg), {
    padding: { left: 2, right: 2, top: 0, bottom: 0 },
    borderStyle: 'round',
    borderColor: 'red',
  }));
}

export function infoBox(title: string, lines: string[]): void {
  const content = lines.map(l => `  ${l}`).join('\n');
  console.log(boxen(`${c.brand.bold(title)}\n\n${content}`, {
    padding: 1,
    borderStyle: 'round',
    borderColor: '#6366f1',
  }));
}

// ─── Section header ───────────────────────────────────────────────────────────
export function sectionHeader(title: string): void {
  console.log('\n' + c.brand.bold(`  ◆ ${title.toUpperCase()}`));
  console.log(c.dim('  ' + '─'.repeat(title.length + 4)));
}

// ─── Logging helpers ─────────────────────────────────────────────────────────
export function log(msg: string): void { console.log(c.text('  ' + msg)); }
export function dim(msg: string): void { console.log(c.dim('  ' + msg)); }
export function ok(msg: string): void  { console.log(c.success('  ✓ ') + c.text(msg)); }
export function err(msg: string): void { console.log(c.error('  ✗ ') + c.text(msg)); }
export function warn(msg: string): void{ console.log(c.warning('  ⚠ ') + c.text(msg)); }
export function info(msg: string): void{ console.log(c.brand('  → ') + c.text(msg)); }

// ─── Auth guard helper ────────────────────────────────────────────────────────
export function requireLoginMessage(): void {
  errorBox('Not logged in. Run: elabs login');
}

// ─── Table renderer ──────────────────────────────────────────────────────────
export function printTable(headers: string[], rows: string[][]): void {
  // Column widths
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length))
  );

  const line = '  ' + widths.map(w => '─'.repeat(w + 2)).join('┬');
  const header = '  │ ' + headers.map((h, i) => c.brand.bold(h.padEnd(widths[i]))).join(' │ ') + ' │';
  const divider = '  ' + widths.map(w => '─'.repeat(w + 2)).join('┼');

  console.log(c.dim(line));
  console.log(header);
  console.log(c.dim(divider));
  for (const row of rows) {
    const rowStr = '  │ ' + row.map((cell, i) =>
      c.text((cell || '').padEnd(widths[i]))
    ).join(' │ ') + ' │';
    console.log(rowStr);
  }
  console.log(c.dim('  ' + widths.map(w => '─'.repeat(w + 2)).join('┴')));
}
