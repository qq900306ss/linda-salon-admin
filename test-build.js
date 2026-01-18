// Simple test to check if TypeScript compilation works
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Checking TypeScript files...\n');

// Check if all required files exist
const requiredFiles = [
  'pages/stylists.tsx',
  'lib/services/stylist.service.ts',
  'lib/services/booking.service.ts',
  'lib/api.ts',
  'tsconfig.json',
  'package.json'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`${exists ? '✓' : '✗'} ${file}`);
  if (!exists) allFilesExist = false;
});

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing!');
  process.exit(1);
}

console.log('\n✓ All required files exist\n');

// Try to run TypeScript compiler
try {
  console.log('Running TypeScript type check...\n');
  const output = execSync('npx tsc --noEmit', {
    encoding: 'utf8',
    cwd: __dirname,
    stdio: 'pipe'
  });
  console.log('✓ TypeScript compilation successful!');
  console.log(output);
} catch (error) {
  console.log('❌ TypeScript compilation failed:\n');
  console.log(error.stdout || error.stderr || error.message);
  process.exit(1);
}
