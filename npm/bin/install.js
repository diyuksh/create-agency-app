#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

const VERSION = require('../package.json').version;
const REPO = 'diyuksh/create-agency-app';

const PLATFORM_MAP = {
  darwin: 'darwin',
  linux: 'linux',
  win32: 'windows',
};

const ARCH_MAP = {
  x64: 'amd64',
  arm64: 'arm64',
};

const platform = PLATFORM_MAP[os.platform()];
const arch = ARCH_MAP[os.arch()];

if (!platform || !arch) {
  console.error(`Unsupported platform: ${os.platform()} ${os.arch()}`);
  process.exit(1);
}

const ext = platform === 'windows' ? '.exe' : '';
const binaryName = `create-agency-app-${platform}-${arch}${ext}`;
const url = `https://github.com/${REPO}/releases/latest/download/${binaryName}`;
const binPath = path.join(__dirname, '..', `create-agency-app${ext}`);

console.log(`Downloading create-agency-app from ${url}...`);

https.get(url, (res) => {
  if (res.statusCode === 301 || res.statusCode === 302) {
    https.get(res.headers.location, handleResponse).on('error', handleError);
  } else {
    handleResponse(res);
  }
}).on('error', handleError);

function handleResponse(res) {
  if (res.statusCode !== 200) {
    console.error(`Failed to download binary: HTTP ${res.statusCode}`);
    process.exit(1);
  }

  const file = fs.createWriteStream(binPath);
  res.pipe(file);

  file.on('finish', () => {
    file.close();
    if (platform !== 'windows') {
      fs.chmodSync(binPath, 0o755);
    }
    console.log('Successfully downloaded create-agency-app!');
  });
}

function handleError(err) {
  console.error(`Error downloading binary: ${err.message}`);
  process.exit(1);
}
