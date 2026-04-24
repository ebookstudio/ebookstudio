-- EbookStudio Production Database Schema
-- Run this in your Neon PostgreSQL Console

-- 1. Books & Drafts Table
CREATE TABLE IF NOT EXISTS books (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    price NUMERIC DEFAULT 0,
    cover_image_url TEXT,
    genre TEXT,
    seller_id TEXT NOT NULL,
    is_draft BOOLEAN DEFAULT true,
    content JSONB,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Purchases Table
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

-- 3. Payouts Table (Writer Earnings)
CREATE TABLE IF NOT EXISTS payouts (
    id SERIAL PRIMARY KEY,
    seller_id TEXT NOT NULL,
    amount NUMERIC NOT NULL, -- in paise
    upi_id TEXT NOT NULL,
    razorpay_payout_id TEXT,
    purchase_id TEXT UNIQUE, -- Linked to the original purchase
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
