#!/bin/bash

TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJlbWFpbCI6ImFkbWluQGxpbmRhc2Fsb24uY29tIiwicm9sZSI6ImFkbWluIiwiZXhwIjoxNzY3NjEzNDM5LCJuYmYiOjE3Njc1MjcwMzksImlhdCI6MTc2NzUyNzAzOX0.bJAVsjVU7AVTOa32CHpV-yozu36UjBG7_NOI-HxOoe8"
API="https://f82cb2me3v.ap-northeast-1.awsapprunner.com"

echo "Creating services..."

curl -s -X POST $API/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Haircut","description":"Professional haircut and styling","category":"Haircut","duration":60,"price":800}' | jq -r '.name'

curl -s -X POST $API/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Hair Coloring","description":"Fashion hair coloring service","category":"Color","duration":120,"price":2500}' | jq -r '.name'

curl -s -X POST $API/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Perm","description":"Professional perm service","category":"Perm","duration":150,"price":3000}' | jq -r '.name'

curl -s -X POST $API/api/v1/admin/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Hair Treatment","description":"Deep conditioning treatment","category":"Treatment","duration":45,"price":1200}' | jq -r '.name'

echo "Creating test customers..."

curl -s -X POST $API/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice Wang","email":"alice@test.com","phone":"0911111111","password":"test123456"}' | jq -r '.user.name'

curl -s -X POST $API/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Bob Chen","email":"bob@test.com","phone":"0922222222","password":"test123456"}' | jq -r '.user.name'

curl -s -X POST $API/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Carol Lin","email":"carol@test.com","phone":"0933333333","password":"test123456"}' | jq -r '.user.name'

echo "Test data created!"
