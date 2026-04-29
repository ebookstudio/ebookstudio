import { exec } from 'child_process';
import ora from 'ora';
import chalk from 'chalk';
import axios from 'axios';
import { saveSession, Session } from '../auth.js';
import { printBanner } from '../ui.js';
import { API_BASE } from '../config.js';

export async function connect() {
  printBanner();
  
  const spinner = ora('Initializing secure connection...').start();
  
  try {
    // 1. Initialize connection with retry
    let initRes;
    let retries = 3;
    while (retries > 0) {
      try {
        initRes = await axios.get(`${API_BASE}/api/cli/start-session?t=${Date.now()}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        break;
      } catch (err: any) {
        if (err.response?.status === 429 && retries > 1) {
          retries--;
          spinner.text = `System busy, retrying... (${3 - retries}/3)`;
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        throw err;
      }
    }
    
    if (!initRes) throw new Error('Failed to initialize connection after retries');
    const { deviceCode } = initRes.data;
    
    spinner.stop();
    
    console.log(`  ${chalk.bold('Action Required:')}`);
    console.log(`  1. Confirm this code matches on your screen: ${chalk.bgWhite.black.bold(` ${deviceCode} `)}`);
    console.log(`  2. Authorize the connection in your browser.\n`);
    
    const authUrl = `${API_BASE}/cli-auth?code=${deviceCode}`;
    
    // Open browser
    const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${command} "${authUrl}"`);
    
    console.log(`  ${chalk.dim('Opening browser...')}`);
    console.log(`  ${chalk.cyan.underline(authUrl)}\n`);

    const pollSpinner = ora('Waiting for authorization...').start();
    
    // 2. Poll for status
    const pollInterval = setInterval(async () => {
      try {
        const checkRes = await axios.get(`${API_BASE}/api/cli/check-connect?deviceCode=${deviceCode}&t=${Date.now()}`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const data = checkRes.data;
        
        if (data.status === 'authorized') {
          clearInterval(pollInterval);
          
          const session: Session = {
            uid: data.uid,
            email: data.email,
            name: data.email.split('@')[0],
            idToken: data.id_token,
            refreshToken: data.refresh_token,
            expiresAt: Date.now() + 3600 * 1000,
          };
          
          saveSession(session);
          pollSpinner.succeed(`Connected successfully as ${chalk.bold(data.email)}!`);
          process.exit(0);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          clearInterval(pollInterval);
          pollSpinner.fail('Connection request expired or was denied.');
          process.exit(1);
        }
        // Keep polling on other errors
      }
    }, 2000);

    // Timeout after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      pollSpinner.fail('Connection timed out.');
      process.exit(1);
    }, 5 * 60 * 1000);

  } catch (error: any) {
    spinner.fail(`Failed to initialize connection: ${error.message}`);
    process.exit(1);
  }
}
