import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function testUpload() {
  const form = new FormData();
  form.append('file', fs.createReadStream('/Users/arpitrajput/Desktop/dummy_products.csv'));

  try {
    // Need a valid token. I can get one by logging in.
    const login = await axios.post('http://localhost:5002/api/v1/auth/login', {
      email: 'admin@freshmart.com',
      password: 'password123'
    });
    const token = login.data.data.accessToken;

    const res = await axios.post('http://localhost:5002/api/v1/bulk/products/import', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.log(err.response?.data || err.message);
  }
}
testUpload();
