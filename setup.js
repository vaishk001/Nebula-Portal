
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create frontend and backend directories if they don't exist
if (!fs.existsSync('frontend')) {
  fs.mkdirSync('frontend');
  console.log('Created frontend directory');
}

if (!fs.existsSync('backend')) {
  fs.mkdirSync('backend');
  console.log('Created backend directory');
}

// Create uploads directory in backend
if (!fs.existsSync(path.join('backend', 'uploads'))) {
  fs.mkdirSync(path.join('backend', 'uploads'), { recursive: true });
  fs.writeFileSync(path.join('backend', 'uploads', '.gitkeep'), '# This file ensures the directory is tracked in git');
  console.log('Created backend/uploads directory');
}

// Move all source files to the frontend directory
const sourceFiles = [
  'src',
  'public',
  'index.html',
  'tsconfig.app.json',
  'tsconfig.json',
  'tsconfig.node.json',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json'
];

sourceFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const destPath = path.join('frontend', file);
    
    // Skip if already in frontend
    if (fs.existsSync(destPath)) {
      console.log(`File/directory already exists in frontend: ${file}`);
      return;
    }
    
    if (fs.statSync(file).isDirectory()) {
      fs.cpSync(file, destPath, { recursive: true });
      console.log(`Copied directory to frontend: ${file}`);
    } else {
      fs.copyFileSync(file, destPath);
      console.log(`Copied file to frontend: ${file}`);
    }
  }
});

console.log('\nSetup complete!');
console.log('\nNext steps:');
console.log('1. Install backend dependencies:');
console.log('   cd backend && npm install');
console.log('\n2. Install frontend dependencies:');
console.log('   cd frontend && npm install');
console.log('\n3. Start both servers:');
console.log('   - In one terminal: cd backend && npm run dev');
console.log('   - In another terminal: cd frontend && npm run dev');
