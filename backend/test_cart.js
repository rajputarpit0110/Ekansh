import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

async function testCart() {
  try {
    const login = await axios.post('http://localhost:5002/api/v1/auth/login', {
      email: 'admin@freshmart.com', // user from screenshot is "Test User", we can check DB or just create a user
      password: 'password123'
    });
    const token = login.data.data.accessToken;

    let products = await axios.get('http://localhost:5002/api/v1/products?limit=1');
    const productId = products.data.data.products[0]._id;

    console.log("Adding product:", productId);

    let res = await axios.post('http://localhost:5002/api/v1/cart', {
      productId,
      quantity: 1
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log("After init +1:", res.data.data.items[0].quantity);

    res = await axios.post('http://localhost:5002/api/v1/cart', {
      productId,
      quantity: 1
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log("After +1:", res.data.data.items[0].quantity);

    res = await axios.post('http://localhost:5002/api/v1/cart', {
      productId,
      quantity: -1
    }, { headers: { Authorization: `Bearer ${token}` } });
    console.log("After -1:", res.data.data.items[0].quantity);

  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}
testCart();
