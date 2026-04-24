Here is your `agent.md` file – a persistent intelligence that will guide every decision, prompt, and code change toward the goal of **$1000/week revenue** for EbookStudio.

Place this file in the root of your project. Reference it in every prompt (e.g., “According to agent.md, what should I do next?”) to keep the AI aligned with your business and technical objectives.

```markdown
# agent.md – EbookStudio Persistent Intelligence

## 🎯 Mission
**Make $1000 USD per week in recurring revenue** by providing a high‑fidelity AI ebook studio + marketplace with 70/30 writer splits, Razorpay payments, and UPI payouts.

## 🧠 Core Principles (Always Follow)
1. **Revenue first** – Every feature must directly or indirectly increase weekly revenue.
2. **Writer retention** – Happy writers create & sell more books. Focus on their success.
3. **Security never optional** – Never expose API keys, validate webhooks, require auth for payouts.
4. **Streaming AI** – Always use Vercel AI SDK + serverless functions for real‑time feedback.
5. **Database as source of truth** – Neon Postgres for all transactions, user data, and payouts.

## 🏗️ Current Architecture (Live on Vercel)
- **Frontend**: Vite + React + Tailwind (port 3000/3001 locally)
- **Backend**: Vercel serverless functions (`/api/*`)
- **Database**: Neon PostgreSQL (tables: `users`, `books`, `purchases`, `subscriptions`, `payouts`)
- **Payments**: Razorpay (Orders, Subscriptions, Webhooks) – live keys in Vercel
- **AI**: Groq (Gemma via `llama-3.1-8b-instant` fallback) exposed via `/api/chat`
- **Payouts**: RazorpayX (direct fetch API) – requires `RAZORPAYX_ACCOUNT_NUMBER`
- **Deployment**: Auto‑deploys from GitHub to `ebookstudio.vercel.app`

## ⚠️ Known Issues & Fix Status
| Issue | Status | Owner |
|-------|--------|-------|
| `IconShieldCheck` missing import | 🔴 FIX NEEDED | Add import from lucide-react in SellerDashboardContent.tsx |
| Neon connection timeout (develop) | 🟡 Fix: use local .env or Vercel proxy | Use `DATABASE_URL` in dev |
| Payouts return simulated ID | 🔴 FIX NEEDED | Uncomment real `fetch` payout call after setting `RAZORPAYX_ACCOUNT_NUMBER` |
| AI model `gemma2-9b-it` decommissioned | 🔴 FIXED | Switched to `llama-3.1-8b-instant` in chat.ts |
| Manual typing loses focus | 🟡 Fix candidate: stable editor IDs | Investigate NovelEditor.tsx re‑renders |

## 🚀 Immediate Next Steps to Reach $1000/week
1. **Make payouts real** – Set `RAZORPAYX_ACCOUNT_NUMBER` in Vercel, uncomment actual payout fetch, test with ₹10.
2. **Fix frontend AI streaming** – Ensure `/api/chat` streams token‑by‑token (use `useCompletion` hook).
3. **Add “Publish to Marketplace” button** – Allow writers to list AI‑generated books for sale.
4. **Launch writer referral program** – Give 10% bonus commission for bringing new active writers.
5. **Implement landing page A/B test** – Optimize free‑trial conversion.

## 📊 Weekly Revenue Tracker (Target: $1000)
| Week | MRR | Marketplace Cut | Total | Notes |
|------|-----|----------------|-------|-------|
| W1 (current) | $0 | $0 | $0 | Fix critical bugs |
| W2 target | $200 | $100 | $300 | First paid AI subscriptions |
| W3 target | $500 | $250 | $750 | 10 writers selling books |
| W4 target | $700 | $300 | $1000 | ✅ GOAL |

## 🔐 Environment Variables Required (Vercel)
- `DATABASE_URL` – Neon postgres connection string
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` – Live mode
- `RAZORPAY_WEBHOOK_SECRET` – Matches dashboard
- `RAZORPAYX_ACCOUNT_NUMBER` – 14‑digit number for payouts
- `PAYOUT_AUTH_TOKEN` – Strong random string (same as in code)
- `GROQ_API_KEY` – For AI streaming

## 🧪 Daily Health Check (run these before any new feature)
```bash
# 1. AI generation works
curl -X POST https://ebookstudio.vercel.app/api/chat -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Write a 10-word hook about AI ebooks"}]}'

# 2. Payout endpoint is secure (should return 401 without token)
curl -X POST https://ebookstudio.vercel.app/api/create-payout

# 3. Webhook is reachable (should return 405 for GET)
curl -X GET https://ebookstudio.vercel.app/api/razorpay-webhook
```

## 🤖 How to Use This File
- **Before every prompt** – Include: “According to agent.md, I need to fix [X] next.”
- **After finishing a task** – Update the “Known Issues” table and the weekly tracker.
- **When trying a new feature** – Ask: “Will this directly increase weekly revenue? If not, defer.”

## ❓ Emergency Rollback
If revenue drops or a critical bug appears, rollback to the last known stable commit:
```bash
git log --oneline | head -5
git reset --hard <commit_hash>
vercel --prod
```

---

**Commit this file to your repo.** The AI will now use it as a persistent brain to drive EbookStudio to $1000/week. 🚀
```

Once you have this file, every time you ask me for help, I will automatically align my answers with the priorities, issues, and revenue goals defined in `agent.md`. Start by fixing the `IconShieldCheck` import error and then move to the real payout implementation.