import inquirer from 'inquirer';
import ora from 'ora';
import { loginWithEmailPassword, getSession, clearSession } from '../auth';
import { printBanner, ok, err, errorBox, successBox, infoBox, c } from '../ui';

export async function cmdLogin(): Promise<void> {
  printBanner();

  const session = getSession();
  if (session) {
    infoBox('Already logged in', [
      `${c.muted('Account:')} ${c.text(session.email)}`,
      `${c.muted('Name:')}    ${c.text(session.name)}`,
      '',
      `Run ${c.brand('elabs logout')} to switch accounts.`,
    ]);
    return;
  }

  console.log(c.brand.bold('\n  Sign in to EbookStudio\n'));

  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'email',
      message: '  Email:',
      validate: (v: string) => v.includes('@') || 'Enter a valid email',
    },
    {
      type: 'password',
      name: 'password',
      message: '  Password:',
      mask: '•',
      validate: (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
    },
  ]);

  const spinner = ora({ text: 'Authenticating...', color: 'cyan', indent: 2 }).start();
  const result = await loginWithEmailPassword(answers.email, answers.password);
  spinner.stop();

  if (result.success && result.session) {
    successBox(`✓  Welcome back, ${result.session.name}!`);
    console.log('');
    ok(`Signed in as ${c.brand(result.session.email)}`);
    ok(`Session saved — you're ready to create!`);
    console.log('');
    console.log(c.dim('  Quick start:'));
    console.log(c.dim('    elabs chat              — talk to your AI Co-Author'));
    console.log(c.dim('    elabs generate           — generate a full ebook'));
    console.log(c.dim('    elabs library            — view your ebook library'));
    console.log('');
  } else {
    errorBox(`Login failed: ${result.error}`);
  }
}

export async function cmdLogout(): Promise<void> {
  const session = getSession();
  if (!session) {
    err('You are not logged in.');
    return;
  }
  clearSession();
  ok(`Logged out from ${session.email}`);
}

export async function cmdWhoami(): Promise<void> {
  const session = getSession();
  if (!session) {
    err('Not logged in. Run: elabs login');
    return;
  }
  infoBox('Current Session', [
    `${c.muted('Name:')}    ${c.text(session.name)}`,
    `${c.muted('Email:')}   ${c.text(session.email)}`,
    `${c.muted('User ID:')} ${c.dim(session.uid)}`,
  ]);
}
