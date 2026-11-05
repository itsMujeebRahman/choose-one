import { spawn } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { createServer } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

const [workspace, ...forwarded] = process.argv.slice(2);
const command = workspace === 'mobile' ? (forwarded.shift() ?? 'start') : 'dev';
const args = forwarded;
if (!['api', 'mobile'].includes(workspace)) throw new Error('Choose the api or mobile workspace.');
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cwd = resolve(root, 'apps', workspace);
const env = {};
for (const name of ['.env', '.env.local']) {
  const path = resolve(cwd, name);
  if (existsSync(path)) Object.assign(env, parseEnv(readFileSync(path, 'utf8')));
}
Object.assign(env, process.env);
const require = createRequire(resolve(cwd, 'package.json'));
function port(name) {
  const value = env[name];
  if (!value || !/^\d+$/.test(value) || Number(value) < 1 || Number(value) > 65535) {
    throw new Error(`Set ${name} to a valid port in apps/${workspace}/.env.local.`);
  }
  return value;
}
if (args.some(arg => /^--(?:port|inspector-port)(?:=|$)/.test(arg))) {
  throw new Error('Configure ports in the workspace environment file, not CLI arguments.');
}
const listenPort = port(workspace === 'api' ? 'API_PORT' : 'EXPO_PORT');
if (!args.includes('--help')) {
  // Fail if occupied instead of allowing Expo to offer a different port.
  await new Promise((resolveCheck, reject) => {
    const server = createServer();
    server.once('error', () => reject(new Error(`Configured port ${listenPort} is already in use.`)));
    server.listen(Number(listenPort), () => server.close(resolveCheck));
  });
}
let cli;
let cliArgs;
if (workspace === 'api') {
  const url = new URL(env.BETTER_AUTH_URL);
  if (url.protocol !== 'https:' && url.port !== listenPort) throw new Error('BETTER_AUTH_URL must use API_PORT for direct HTTP development, or an HTTPS tunnel/deployment origin.');
  cli = resolve(dirname(require.resolve('wrangler/package.json')), 'bin/wrangler.js');
  if (!env.API_HOST) throw new Error('Set API_HOST in apps/api/.env.local.');
  cliArgs = ['dev', '--ip', env.API_HOST, '--port', listenPort, '--inspector-port', port('API_INSPECTOR_PORT'), ...args];
} else {
  if (!env.EXPO_PUBLIC_API_URL) throw new Error('Set EXPO_PUBLIC_API_URL in apps/mobile/.env.local.');
  cli = require.resolve('expo/bin/cli');
  cliArgs = [command, '--port', listenPort, ...args];
}
const child = spawn(process.execPath, [cli, ...cliArgs], { cwd, env, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { console.error(error.message); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
