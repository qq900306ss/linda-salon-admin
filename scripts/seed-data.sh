#!/bin/bash

# Get admin token
TOKEN=$(curl -s -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lindasalon.com","password":"admin123456"}' | \
  grep -o '"access_token":"[^"]*' | sed 's/"access_token":"//')

echo "Token: ${TOKEN:0:50}..."

# Create Services
echo "Creating services..."

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"洗髮","description":"專業洗髮服務","duration":30,"price":300,"is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"剪髮","description":"專業剪髮造型","duration":60,"price":800,"is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"染髮","description":"時尚染髮服務","duration":120,"price":2500,"is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"燙髮","description":"專業燙髮服務","duration":150,"price":3000,"is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"護髮","description":"深層護髮療程","duration":45,"price":1200,"is_active":true}'

# Create Stylists
echo "Creating stylists..."

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/stylists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"王小美","bio":"資深設計師，擅長短髮造型","specialty":"剪髮、造型","is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/stylists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"李大華","bio":"專業染燙師，10年經驗","specialty":"染髮、燙髮","is_active":true}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/admin/stylists \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"陳雅婷","bio":"時尚造型師，擅長流行趨勢","specialty":"剪髮、染髮、造型","is_active":true}'

# Register test customers
echo "Creating test customers..."

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"張小芳","email":"customer1@test.com","phone":"0912111111","password":"test123456"}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"林美玲","email":"customer2@test.com","phone":"0922222222","password":"test123456"}'

curl -X POST https://f82cb2me3v.ap-northeast-1.awsapprunner.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"黃志明","email":"customer3@test.com","phone":"0933333333","password":"test123456"}'

echo "Test data created successfully!"
