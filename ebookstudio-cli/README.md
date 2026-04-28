# elabs-cli

Control **[EbookStudio](https://ebookstudio.vercel.app)** from your terminal.  
Same account. Same data. Every feature — without opening a browser.

## Install

```bash
npm install -g elabs-cli
```

## Commands

```bash
elabs login                                    # Sign in (same account as browser)
elabs logout                                   # Sign out
elabs whoami                                   # Show current user

elabs chat                                     # Interactive AI Co-Author REPL
elabs chat --prompt "write chapter 1 on X"    # Single prompt

elabs generate                                 # Plan a full ebook (interactive)
elabs generate --topic "Quantum Computing"     # With topic
elabs generate --topic "..." --output out.json # Save structure to file

elabs library                                  # View drafts + published ebooks
elabs publish                                  # Publish a draft (prompts for price)
elabs publish --id <bookId> --price 299        # Direct publish
elabs publish --free                           # Publish for free

elabs sales                                    # View earnings & sales history
elabs payout --upi name@upi --amount 500       # Withdraw earnings via Razorpay X

elabs studio                                   # Open the browser studio
```

## Architecture

```
Browser (ebookstudio.vercel.app)
       │
       ▼
  /api/agent/chat     ← AI streaming
  /api/publish-book   ← Marketplace
  /api/create-payout  ← Razorpay X
  /api/get-sales      ← Analytics
       ▲
elabs-cli (this package)
  → Same Firebase auth token
  → Same Neon/Postgres data
  → Same account — upgrade CLI = upgrade browser
```

## Development

```bash
git clone https://github.com/ebookstudio/ebookstudio.git
cd ebookstudio/elabs-cli
npm install
npm run build
npm link          # test locally as `elabs`
```

## Publish to npm

```bash
npm login
npm publish
```

---

Built with ❤️ by [EbookStudio](https://ebookstudio.vercel.app)
