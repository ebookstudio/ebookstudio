# 🚀 Neon Database Production Sync

Copy and paste the following SQL block into your **Neon Console** to ensure your database is ready for live payouts and commercial transactions.

```sql
-- 1. Ensure Payouts Table is Commercial-Ready
CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    seller_id TEXT NOT NULL,
    amount NUMERIC NOT NULL, -- in paise
    upi_id TEXT NOT NULL,
    razorpay_payout_id TEXT,
    purchase_id TEXT UNIQUE,
    sale_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Apply missing columns if table already exists
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS purchase_id TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS sale_id TEXT;
ALTER TABLE payouts ADD COLUMN IF NOT EXISTS razorpay_payout_id TEXT;

-- 2. Seller Payment Methods (Tracks Razorpay X Contact & Fund Account IDs)
CREATE TABLE IF NOT EXISTS seller_payment_methods (
    seller_id TEXT PRIMARY KEY,
    razorpay_contact_id TEXT,
    razorpay_fund_account_id TEXT,
    upi_id TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Purchases Table (Ensure Razorpay order tracking)
CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    book_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    razorpay_order_id TEXT UNIQUE,
    razorpay_payment_id TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id SERIAL PRIMARY KEY,
    seller_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    razorpay_subscription_id TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    current_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Indexes for Performance and Integrity
CREATE UNIQUE INDEX IF NOT EXISTS idx_payouts_purchase_id ON payouts(purchase_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_purchases_razorpay_order ON purchases(razorpay_order_id);
```

### **Next Step**
After running the SQL:
1.  Run the test script: `npx ts-node scratch/test-payout-trigger.ts`
2.  Provide the `payout_id` to get your final audit verdict.
