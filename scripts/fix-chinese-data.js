const https = require('https');

const API_BASE = 'https://f82cb2me3v.ap-northeast-1.awsapprunner.com';

// Admin credentials
const loginData = JSON.stringify({
  email: 'admin@lindasalon.com',
  password: 'admin123456'
});

// Step 1: Login to get token
const loginOptions = {
  hostname: 'f82cb2me3v.ap-northeast-1.awsapprunner.com',
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

console.log('Logging in...');

const loginReq = https.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      const token = response.tokens.access_token;
      console.log('Login successful, token obtained');

      // Step 2: Update stylists
      updateStylists(token);

    } catch (err) {
      console.error('Login failed:', err);
      console.error('Response:', data);
    }
  });
});

loginReq.on('error', (err) => {
  console.error('Login request error:', err);
});

loginReq.write(loginData);
loginReq.end();

function updateStylists(token) {
  const stylists = [
    { id: 1, name: '王小美', bio: '資深設計師，擅長短髮造型', specialty: '剪髮、造型' },
    { id: 2, name: '李大華', bio: '專業染燙師，10年經驗', specialty: '染髮、燙髮' },
    { id: 3, name: '陳雅婷', bio: '時尚造型師，擅長流行趨勢', specialty: '剪髮、染髮、造型' }
  ];

  console.log('\nUpdating stylists...');

  stylists.forEach((stylist, index) => {
    setTimeout(() => {
      const updateData = JSON.stringify({
        name: stylist.name,
        bio: stylist.bio,
        specialty: stylist.specialty,
        is_active: true
      });

      const options = {
        hostname: 'f82cb2me3v.ap-northeast-1.awsapprunner.com',
        path: `/api/v1/admin/stylists/${stylist.id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(updateData, 'utf8')
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✓ Updated stylist ${stylist.id}: ${stylist.name}`);
          } else {
            console.error(`✗ Failed to update stylist ${stylist.id}:`, data);
          }

          // After last stylist, update services
          if (index === stylists.length - 1) {
            setTimeout(() => updateServices(token), 500);
          }
        });
      });

      req.on('error', (err) => {
        console.error(`Error updating stylist ${stylist.id}:`, err);
      });

      req.write(updateData);
      req.end();

    }, index * 500);
  });
}

function updateServices(token) {
  const services = [
    { id: 1, name: '洗髮', description: '專業洗髮服務', category: '基礎服務', duration: 30, price: 300 },
    { id: 2, name: '剪髮', description: '專業剪髮造型', category: '造型服務', duration: 60, price: 800 },
    { id: 3, name: '染髮', description: '時尚染髮服務', category: '染燙服務', duration: 120, price: 2500 },
    { id: 4, name: '燙髮', description: '專業燙髮服務', category: '染燙服務', duration: 150, price: 3000 },
    { id: 5, name: '護髮', description: '深層護髮療程', category: '護理服務', duration: 45, price: 1200 }
  ];

  console.log('\nUpdating services...');

  services.forEach((service, index) => {
    setTimeout(() => {
      const updateData = JSON.stringify({
        name: service.name,
        description: service.description,
        category: service.category,
        duration: service.duration,
        price: service.price,
        is_active: true
      });

      const options = {
        hostname: 'f82cb2me3v.ap-northeast-1.awsapprunner.com',
        path: `/api/v1/admin/services/${service.id}`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Authorization': `Bearer ${token}`,
          'Content-Length': Buffer.byteLength(updateData, 'utf8')
        }
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            console.log(`✓ Updated service ${service.id}: ${service.name}`);
          } else {
            console.error(`✗ Failed to update service ${service.id}:`, data);
          }

          if (index === services.length - 1) {
            console.log('\n✓ All updates completed!');
            process.exit(0);
          }
        });
      });

      req.on('error', (err) => {
        console.error(`Error updating service ${service.id}:`, err);
      });

      req.write(updateData);
      req.end();

    }, index * 500);
  });
}
