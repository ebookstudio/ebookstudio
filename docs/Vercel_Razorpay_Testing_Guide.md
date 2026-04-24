# Testing Razorpay on Vercel Preview Deployments

Testing payments, subscriptions, and webhooks safely without affecting your production users is crucial. This guide explains how to leverage Vercel's Preview Deployments alongside Razorpay's Test Mode to build a robust testing environment.

## 1. Understanding Vercel Preview Deployments

Every time you open a Pull Request (or push to a non-production branch), Vercel automatically generates a **Preview Deployment** with a unique URL (e.g., `https://ebookstudio-lapxaprpb-ebookstudio.vercel.app`). 

This environment acts identically to production but is entirely isolated, allowing you to safely test new features.

## 2. Setting up Environment Variables

To ensure your Preview environment uses test keys (and doesn't accidentally charge real money), you must configure your environment variables in Vercel.

1. Go to your Vercel Project Dashboard.
2. Navigate to **Settings** > **Environment Variables**.
3. For your Razorpay keys (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`), uncheck the "Production" box and ensure only "Preview" (and "Development") are checked.
4. Paste your **Razorpay Test Keys** into the value fields.
5. Save the variables.
6. Trigger a new deployment so the new variables take effect.

> [!WARNING]  
> Never use your Live Razorpay keys in the Preview or Development environments.

## 3. Configuring the Razorpay Webhook

Razorpay uses webhooks to notify your application of asynchronous events (like a successful subscription payment).

1. Log in to your Razorpay Dashboard and ensure you are in **Test Mode**.
2. Go to **Account & Settings** > **Webhooks**.
3. Click **Add New Webhook**.
4. Enter the Webhook URL using your Vercel preview domain:
   `https://ebookstudio-lapxaprpb-ebookstudio.vercel.app/api/razorpay-webhook`
5. Select the relevant events (e.g., `subscription.charged`, `payment.captured`).
6. Enter a secret (this should match your `RAZORPAY_WEBHOOK_SECRET` environment variable).
7. Save.

> [!IMPORTANT]  
> Because Vercel generates a new URL for every commit, you will need to update the webhook URL in the Razorpay Test Dashboard each time you want to test against a *new* preview deployment. Alternatively, you can configure a fixed preview domain (e.g., `staging.ebookstudio.com`) mapped to a specific `staging` branch to avoid updating this manually.

## 4. Database Isolation

When testing subscriptions, it's recommended to isolate your database. If you use Neon (PostgreSQL):
- Create a new branch in your Neon dashboard (e.g., `preview-db`).
- Set the `DATABASE_URL` environment variable for your Vercel "Preview" environment to point to this Neon branch.
- This ensures test subscriptions and transactions don't pollute your production metrics.

## 5. Testing Subscriptions

Once configured, you can test the entire flow on your preview URL.
- When prompted for payment, use Razorpay's provided test cards.
- **Test Card Number:** `4111 1111 1111 1111`
- **Expiry:** Any future date (e.g., `12/26`)
- **CVV:** Any 3 digits (e.g., `123`)

Upon successful payment, verify that your database (`subscriptions` table) successfully registered the active status via the webhook.
