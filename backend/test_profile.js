import axios from 'axios';
import FormData from 'form-data';
import fs from 'fs';

async function run() {
  try {
    const loginRes = await axios.post('http://localhost:5002/api/v1/auth/login', {
      email: 'test@freshmart.com',
      password: 'password123'
    });
    const cookies = loginRes.headers['set-cookie'];
    
    const formData = new FormData();
    formData.append('name', 'Test User Updated');
    formData.append('phone', '1234567890');
    
    // Create a real valid image to test
    // Download a tiny 1x1 image
    // we just need a valid image file, otherwise Cloudinary will reject it
    const fileData = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync('dummy.png', fileData);
    
    formData.append('avatar', fs.createReadStream('dummy.png'), { filename: 'dummy.png', contentType: 'image/png' });

    const updateRes = await axios.put('http://localhost:5002/api/v1/auth/profile', formData, {
      headers: {
        ...formData.getHeaders(),
        Cookie: cookies.join('; ')
      }
    });

    console.log('Update success:', updateRes.data);
  } catch (error) {
    console.error('Update failed:', error.response?.data || error.message);
  }
}
run();
