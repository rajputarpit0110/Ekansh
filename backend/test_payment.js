import axios from 'axios';
async function test() {
  try {
    const loginRes = await axios.post('http://localhost:5002/api/v1/auth/login', { email: 'test@freshmart.com', password: 'password123' });
    const cookie = loginRes.headers['set-cookie'];
    const keyRes = await axios.get('http://localhost:5002/api/v1/payments/razorpay/key', { headers: { Cookie: cookie.join('; ') } });
    console.log('Key response:', keyRes.data);
    const orderRes = await axios.post('http://localhost:5002/api/v1/payments/razorpay/process', { amount: 100 }, { headers: { Cookie: cookie.join('; ') } });
    console.log('Order response:', orderRes.data);
  } catch (e) { console.error('Error:', e.response?.data || e.message); }
}
test();
