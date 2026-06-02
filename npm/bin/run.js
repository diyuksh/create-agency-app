#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const fs = require('fs');

const ext = os.platform() === 'win32' ? '.exe' : '';
const binPath = path.join(__dirname, '..', `create-agency-app${ext}`);

if (!fs.existsSync(binPath)) {
  console.error(`Binary not found at ${binPath}. Please reinstall the package.`);
  process.exit(1);
}

const args = process.argv.slice(2);
const proc = spawn(binPath, args, { stdio: 'inherit' });

proc.on('exit', (code) => {
  process.exit(code);
});
