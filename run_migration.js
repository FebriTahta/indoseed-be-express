const { spawn } = require('child_process');

const child = spawn('npx', ['prisma', 'migrate', 'dev', '--name', 'add_logo_kotak']);

child.stdout.on('data', (data) => {
  process.stdout.write(data);
  if (data.toString().includes('We need to reset the MySQL database')) {
    child.stdin.write('y\n');
  }
});

child.stderr.on('data', (data) => {
  process.stderr.write(data);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
