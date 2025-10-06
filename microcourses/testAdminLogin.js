const https = require('https');

async function testAdminLogin() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'admin@microcourses.com',
      password: 'admin123'
    });

    const options = {
      hostname: 'micro-courses-aoit.onrender.com',
      port: 443,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          console.log('Login successful!');
          console.log('User:', response.user);
          console.log('Role:', response.user.role);

          // Test admin routes
          testAdminRoutes(response.token);
        } catch (err) {
          console.error('Error parsing response:', err);
        }
      });
    });

    req.on('error', (err) => {
      console.error('Request error:', err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

function testAdminRoutes(token) {
  const options = {
    hostname: 'micro-courses-aoit.onrender.com',
    port: 443,
    path: '/api/admin/review/courses',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const courses = JSON.parse(data);
        console.log('\nAdmin courses pending review:', courses.length);
        courses.forEach(course => {
          console.log(`- ${course.title} (${course.status})`);
        });
      } catch (err) {
        console.error('Error parsing admin response:', err);
      }
    });
  });

  req.on('error', (err) => {
    console.error('Admin request error:', err);
  });

  req.end();
}

testAdminLogin().catch(console.error);
