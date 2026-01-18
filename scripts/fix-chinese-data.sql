-- Fix Chinese character encoding for stylists
UPDATE stylists SET
  name = '王小美',
  bio = '資深設計師，擅長短髮造型',
  specialty = '剪髮、造型'
WHERE id = 1;

UPDATE stylists SET
  name = '李大華',
  bio = '專業染燙師，10年經驗',
  specialty = '染髮、燙髮'
WHERE id = 2;

UPDATE stylists SET
  name = '陳雅婷',
  bio = '時尚造型師，擅長流行趨勢',
  specialty = '剪髮、染髮、造型'
WHERE id = 3;

-- Fix service names and descriptions
UPDATE services SET
  name = '洗髮',
  description = '專業洗髮服務',
  category = '基礎服務'
WHERE id = 1;

UPDATE services SET
  name = '剪髮',
  description = '專業剪髮造型',
  category = '造型服務'
WHERE id = 2;

UPDATE services SET
  name = '染髮',
  description = '時尚染髮服務',
  category = '染燙服務'
WHERE id = 3;

UPDATE services SET
  name = '燙髮',
  description = '專業燙髮服務',
  category = '染燙服務'
WHERE id = 4;

UPDATE services SET
  name = '護髮',
  description = '深層護髮療程',
  category = '護理服務'
WHERE id = 5;

-- Update test customer names
UPDATE users SET name = '張小芳' WHERE email = 'customer1@test.com';
UPDATE users SET name = '林美玲' WHERE email = 'customer2@test.com';
UPDATE users SET name = '黃志明' WHERE email = 'customer3@test.com';
UPDATE users SET name = '管理員' WHERE email = 'admin@lindasalon.com';
