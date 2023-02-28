import { spawn as spwn } from 'child_process';

export const spawn = (
  cmd: string,
  args: ReadonlyArray<string>,
) => new Promise((resolve, reject) => {
  const cp = spwn(cmd, args);
  const error: string[] = [];
  const stdout: string[] = [];
  cp.stdout.on('data', (data) => {
    stdout.push(data.toString());
  });

  cp.on('error', (e) => {
    error.push(e.toString());
  });

  cp.on('close', () => {
    if (error.length) reject(error.join(''));
    else resolve(stdout.join(''));
  });
});

(async () => {
  try {
    const stdOut = await spawn('docker', ['--version']);
    console.log('stdOut: ', stdOut);
  } catch (error) {
    console.log('error:', error);
    process.exit(1);
  }
})();