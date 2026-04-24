import fetch from 'node-fetch';

async function testPayout() {
  const API_URL = 'https://ebookstudio.vercel.app/api/create-payout';
  const AUTH_TOKEN = process.env.PAYOUT_AUTH_TOKEN;

  if (!AUTH_TOKEN) {
    console.error('❌ Error: PAYOUT_AUTH_TOKEN is not set.');
    process.exit(1);
  }

  console.log(`🚀 Sending Payout Request to: ${API_URL}`);

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`
    },
    body: JSON.stringify({
      sellerId: 'test_user_123',
      amount: 1000,
      upiId: 'test@razorpay',
      purchaseId: 'test_audit_final_' + Date.now()
    })
  });

  const rawBody = await response.text(); // Consume body ONLY ONCE
  console.log('--- Raw Audit Response ---');
  console.log('Status Code:', response.status);
  
  try {
    const data = JSON.parse(rawBody);
    console.log('JSON Output:', JSON.stringify(data, null, 2));
    
    if (data.success) {
        console.log('\n✅ Payout Successfully Triggered!');
        console.log(`Auditor: Verify Payout ID ${data.payout_id} in Dashboard.`);
    }
  } catch (e) {
    console.log('Server returned non-JSON response:');
    console.log(rawBody.substring(0, 1000));
  }
}

testPayout().catch(console.error);
