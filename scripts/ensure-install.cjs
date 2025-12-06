const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Check for node_modules and a key package
if (!fs.existsSync(path.join(__dirname, '..', 'node_modules'))) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
  } catch (err) {
    console.error('❌ npm install failed');
    process.exit(1);
  }
}

// Run npm install if needed
const packageLock = path.join(__dirname, '..', 'package-lock.json');
const nodeModules = path.join(__dirname, '..', 'node_modules');

if (fs.existsSync(packageLock)) {
  const lockStat = fs.statSync(packageLock);
  const moduleStat = fs.existsSync(nodeModules) ? fs.statSync(nodeModules) : null;
  
  if (!moduleStat || lockStat.mtime > moduleStat.mtime) {
    console.log('📦 npm install needed (package-lock.json is newer)');
    try {
      execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
    } catch (err) {
      console.error('❌ npm install failed');
      process.exit(1);
    }
  }
}

console.log('✅ Dependencies up to date');
