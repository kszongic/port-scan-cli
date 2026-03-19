#!/usr/bin/env node
'use strict';

const net = require('net');

const HELP = `
Usage: port-scan <host> [ports] [options]

Scan TCP ports on a host.

Arguments:
  host          Target hostname or IP (e.g. localhost, 192.168.1.1)
  ports         Port range or list (default: 1-1024)
                Examples: 80  80,443,8080  1-65535  20-100

Options:
  -t, --timeout <ms>   Connection timeout per port (default: 1000)
  -c, --concurrency <n> Max concurrent connections (default: 100)
  --json               Output as JSON
  -h, --help           Show this help
  -v, --version        Show version

Examples:
  port-scan localhost
  port-scan 192.168.1.1 80,443,8080
  port-scan example.com 1-65535 -t 500 -c 200
  port-scan localhost 1-10000 --json
`;

function parseArgs(argv) {
  const args = { host: null, ports: [], timeout: 1000, concurrency: 100, json: false };
  let i = 0;
  while (i < argv.length) {
    const a = argv[i];
    if (a === '-h' || a === '--help') { process.stdout.write(HELP.trim() + '\n'); process.exit(0); }
    if (a === '-v' || a === '--version') {
      process.stdout.write(require('./package.json').version + '\n'); process.exit(0);
    }
    if (a === '-t' || a === '--timeout') { args.timeout = parseInt(argv[++i], 10); i++; continue; }
    if (a === '-c' || a === '--concurrency') { args.concurrency = parseInt(argv[++i], 10); i++; continue; }
    if (a === '--json') { args.json = true; i++; continue; }
    if (!args.host) { args.host = a; i++; continue; }
    // parse ports
    args.ports = parsePorts(a);
    i++;
  }
  if (!args.host) { process.stderr.write('Error: host is required\n' + HELP.trim() + '\n'); process.exit(1); }
  if (args.ports.length === 0) args.ports = range(1, 1024);
  return args;
}

function parsePorts(str) {
  const ports = [];
  for (const part of str.split(',')) {
    if (part.includes('-')) {
      const [a, b] = part.split('-').map(Number);
      for (let p = a; p <= b; p++) ports.push(p);
    } else {
      ports.push(Number(part));
    }
  }
  return ports.filter(p => p >= 1 && p <= 65535);
}

function range(a, b) { const r = []; for (let i = a; i <= b; i++) r.push(i); return r; }

function scanPort(host, port, timeout) {
  return new Promise(resolve => {
    const sock = new net.Socket();
    sock.setTimeout(timeout);
    sock.once('connect', () => { sock.destroy(); resolve(port); });
    sock.once('timeout', () => { sock.destroy(); resolve(null); });
    sock.once('error', () => { sock.destroy(); resolve(null); });
    sock.connect(port, host);
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { host, ports, timeout, concurrency, json } = args;
  const total = ports.length;

  if (!json) {
    process.stdout.write(`Scanning ${host} (${total} ports, timeout=${timeout}ms, concurrency=${concurrency})\n\n`);
  }

  const open = [];
  let idx = 0;

  async function worker() {
    while (idx < ports.length) {
      const port = ports[idx++];
      const result = await scanPort(host, port, timeout);
      if (result !== null) {
        open.push(result);
        if (!json) process.stdout.write(`  ${result}/tcp  open\n`);
      }
    }
  }

  const workers = [];
  for (let i = 0; i < Math.min(concurrency, total); i++) workers.push(worker());
  await Promise.all(workers);

  open.sort((a, b) => a - b);

  if (json) {
    process.stdout.write(JSON.stringify({ host, open, scanned: total }) + '\n');
  } else {
    process.stdout.write(`\nDone. ${open.length} open port(s) found.\n`);
  }
}

main().catch(err => { process.stderr.write(err.message + '\n'); process.exit(1); });
