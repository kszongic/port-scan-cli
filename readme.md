# @kszongic/port-scan-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/port-scan-cli)](https://www.npmjs.com/package/@kszongic/port-scan-cli)
[![license](https://img.shields.io/npm/l/@kszongic/port-scan-cli)](./LICENSE)

Fast TCP port scanner CLI. Zero dependencies.

## Install

```bash
npm install -g @kszongic/port-scan-cli
```

## Usage

```bash
# Scan common ports (1-1024) on localhost
port-scan localhost

# Scan specific ports
port-scan 192.168.1.1 80,443,8080

# Scan a full range
port-scan example.com 1-65535 -t 500 -c 200

# JSON output
port-scan localhost 1-10000 --json
```

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-t, --timeout <ms>` | Connection timeout per port | `1000` |
| `-c, --concurrency <n>` | Max concurrent connections | `100` |
| `--json` | Output as JSON | `false` |
| `-h, --help` | Show help | |
| `-v, --version` | Show version | |

## Examples

```
$ port-scan localhost 22,80,443,3000,5432,8080
Scanning localhost (6 ports, timeout=1000ms, concurrency=100)

  22/tcp  open
  80/tcp  open
  5432/tcp  open

Done. 3 open port(s) found.
```

```
$ port-scan localhost 80,443 --json
{"host":"localhost","open":[80],"scanned":2}
```

## License

MIT © 2026 kszongic
