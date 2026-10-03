const { spawn } = require('child_process');
const path = require('path');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');
console.log('\x1b[36m%s\x1b[0m', '  🚀 Starting AURA Gastronomy Full-Stack Platform...   ');
console.log('\x1b[36m%s\x1b[0m', '═══════════════════════════════════════════════════════');

// 1. Launch Backend Server (Port 5000)
const backend = spawn('node', [path.join(__dirname, 'backend', 'server.js')], {
  stdio: 'pipe',
  shell: true,
  cwd: __dirname,
  env: { ...process.env, NODE_ENV: 'development', PORT: '5000' }
});

backend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log('\x1b[34m[BACKEND]\x1b[0m ' + line);
  });
});

backend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error('\x1b[31m[BACKEND ERR]\x1b[0m ' + line);
  });
});

// 2. Launch Frontend Dev Server (Port 5173)
const frontend = spawn(npmCmd, ['run', 'dev'], {
  stdio: 'pipe',
  shell: true,
  cwd: path.join(__dirname, 'frontend'),
  env: { ...process.env }
});

frontend.stdout.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.log('\x1b[32m[FRONTEND]\x1b[0m ' + line);
  });
});

frontend.stderr.on('data', (data) => {
  const lines = data.toString().trim().split('\n');
  lines.forEach((line) => {
    if (line.trim()) console.error('\x1b[33m[FRONTEND MSG]\x1b[0m ' + line);
  });
});

const cleanup = () => {
  console.log('\n\x1b[33mShutting down all development servers...\x1b[0m');
  try {
    if (isWindows) {
      if (backend.pid) spawn('taskkill', ['/pid', backend.pid, '/f', '/t']);
      if (frontend.pid) spawn('taskkill', ['/pid', frontend.pid, '/f', '/t']);
    } else {
      backend.kill('SIGTERM');
      frontend.kill('SIGTERM');
    }
  } catch (e) {
    // Ignore cleanup errors
  }
  process.exit(0);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
