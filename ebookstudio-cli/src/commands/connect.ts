import http from 'http';
import { exec } from 'child_process';
import url from 'url';
import ora from 'ora';
import chalk from 'chalk';
import { saveSession, Session } from '../auth.js';
import { printBanner } from '../ui.js';
import { API_BASE } from '../config.js';

export async function connect() {
  printBanner();
  
  const spinner = ora('Initializing secure connection...').start();
  
  const startServer = (p: number) => {
    const server = http.createServer(async (req, res) => {
      const parsedUrl = url.parse(req.url || '', true);
      
      if (parsedUrl.pathname === '/callback') {
        const { idToken, email, refreshToken, uid } = parsedUrl.query;
        
        if (idToken && email && refreshToken && uid) {
          const session: Session = {
            uid: uid as string,
            email: email as string,
            name: (email as string).split('@')[0],
            idToken: idToken as string,
            refreshToken: refreshToken as string,
            expiresAt: Date.now() + 3600 * 1000, // 1 hour default
          };
          saveSession(session);
          
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: sans-serif; text-align: center; padding-top: 50px; background: #f9fafb;">
                <h1 style="color: #4f46e5;">Successfully Connected!</h1>
                <p>You can close this window and return to your terminal.</p>
              </body>
            </html>
          `);
          
          spinner.succeed(`Connected as ${chalk.bold(email)}`);
          server.close();
          process.exit(0);
        } else {
          res.writeHead(400);
          res.end('Authentication failed: Missing session data');
          spinner.fail('Authentication failed.');
        }
      }
    });

    server.listen(p, () => {
      const authUrl = `${API_BASE}/cli-auth?port=${p}`;
      spinner.text = `Opening browser for authentication...`;
      
      const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
      exec(`${command} "${authUrl}"`);
      
      console.log(`\n  ${chalk.dim('If the browser didn\'t open, visit:')}`);
      console.log(`  ${chalk.cyan.underline(authUrl)}\n`);
    }).on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        startServer(p + 1);
      } else {
        spinner.fail(`Failed to start local server: ${err.message}`);
      }
    });
  };

  startServer(9999);
}
