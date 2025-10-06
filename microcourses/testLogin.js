const axios = require('axios');

const API_BASE_URL = 'https://micro-courses-aoit.onrender.com/api';

async function testLogin() {
  try {
    console.log('Testing login for test creator user...');

    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'creator@test.com',
      password: 'password123'
    });

    console.log('Login response:');
    console.log('Token:', response.data.token ? 'Present' : 'Missing');
    console.log('User data:', response.data.user);

    console.log('\nRole in response:', response.data.user.role);
    console.log('CreatorApplicationStatus in response:', response.data.user.creatorApplicationStatus);

  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
  }
}

testLogin();
