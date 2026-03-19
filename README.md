# @kszongic/port-scan-cli

[![npm version](https://img.shields.io/npm/v/@kszongic/port-scan-cli)](https://www.npmjs.com/package/@kszongic/port-scan-cli)
[![npm downloads](https://img.shields.io/npm/dm/@kszongic/port-scan-cli)](https://www.npmjs.com/package/@kszongic/port-scan-cli)
[![license](https://img.shields.io/npm/l/@kszongic/port-scan-cli)](./LICENSE)
![node](https://img.shields.io/node/v/@kszongic/port-scan-cli)
![zero deps](https://img.shields.io/badge/dependencies-0-brightgreen)
![cross-platform](https://img.shields.io/badge/platform-win%20%7C%20mac%20%7C%20linux-lightgrey)

> Fast TCP port scanner for the terminal. Zero dependencies.

```
$ port-scan 192.168.1.1 22,80,443,3000,5432,8080
Scanning 192.168.1.1 (6 ports, timeout=1000ms, concurrency=100)

  22/tcp   open
  80/tcp   open
  5432/tcp open

Done. 3 open port(s) found.
```

## Why?

- **Zero dependencies** - single install, no supply-chain bloat
- **Cross-platform** - works on Windows, macOS, and Linux
- **Fast** - configurable concurrency (up to thousands of parallel connections)
- **JSON output** - pipe results to jq, monitoring scripts, or dashboards
- **No root required** - pure TCP connect scan, no raw sockets needed
- **npx-friendly** - `npx @kszongic/port-scan-cli localhost` for one-off scans

## Install

```bash
npm install -g @kszongic/port-scan-cli
```

Or run without installing:

```bash
npx @kszongic/port-scan-cli localhost 80,443
```

## Usage

```bash
# Scan common ports (1-1024) on localhost
port-scan localhost

# Scan specific ports
port-scan 192.168.1.1 80,443,8080

# Scan a full range with custom timeout and concurrency
port-scan example.com 1-65535 -t 500 -c 200

# JSON output for scripting
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

## Recipes

### Quick health check after deployment

```bash
port-scan my-server.com 80,443,5432,6379 -t 2000
```

Verify that your web server, database, and cache are all reachable after a deploy.

### JSON to monitoring pipeline

```bash
port-scan prod-host 80,443,3000,5432 --json | jq '.open'
```

Feed results into Datadog, Grafana, or a Slack webhook for automated alerting.

### Full-range scan with high concurrency

```bash
port-scan 10.0.0.5 1-65535 -t 300 -c 500
```

Scan all 65,535 ports in under a minute on fast networks.

### Scan multiple hosts

```bash
for host in web-1 web-2 web-3; do
  echo "=== System.Management.Automation.Internal.Host.InternalHost ==="
  port-scan "System.Management.Automation.Internal.Host.InternalHost" 80,443,8080 --json
done
```

### Docker compose service check

```bash
docker compose up -d
sleep 5
port-scan localhost 3000,5432,6379,9200
```

Confirm all containers are listening before running integration tests.

### CI security audit

```yaml
- name: Check no unexpected ports
  run: |
    RESULT=
    OPEN=
    if [ "" -gt 5 ]; then
      echo "::error::Too many open ports"
      exit 1
    fi
```

## How It Works

port-scan-cli performs a TCP connect scan (same as `nmap -sT`). For each port it opens a standard TCP connection:

1. **Open** - TCP handshake succeeds
2. **Closed/Filtered** - connection refused or timeout

Concurrency is managed with a semaphore pattern. No raw sockets, no pcap, no elevated privileges. Just Node.js `net.connect()`.

## Use Cases

- **DevOps** - verify services are up after deployment
- **Security** - audit which ports are exposed on staging/production
- **Local dev** - find what is running on your machine
- **CI/CD** - gate deployments on port availability
- **Network debugging** - quickly identify connectivity issues

## Comparison

| Feature | port-scan-cli | nmap | masscan | net-scan |
|---------|:---:|:---:|:---:|:---:|
| Zero deps | Yes | No | No | No |
| Cross-platform | Yes | Yes | Partial | Yes |
| No root needed | Yes | Partial | No | Yes |
| JSON output | Yes | Yes | Yes | No |
| npm install | Yes | No | No | Yes |
| SYN scan | No | Yes | Yes | No |

**Use port-scan-cli** for quick, dependency-free port checks from Node.js or CI.
**Use nmap** for OS fingerprinting, service detection, or advanced scan types.

## Related Tools

- [@kszongic/find-open-port-cli](https://www.npmjs.com/package/@kszongic/find-open-port-cli) - Find an available port
- [@kszongic/kill-port-cli](https://www.npmjs.com/package/@kszongic/kill-port-cli) - Kill the process on a port
- [@kszongic/cidr-wildcard-cli](https://www.npmjs.com/package/@kszongic/cidr-wildcard-cli) - CIDR/subnet calculator
- [@kszongic/ip-in-range-cli](https://www.npmjs.com/package/@kszongic/ip-in-range-cli) - Check if IP falls in a CIDR range
- [@kszongic/url-status-cli](https://www.npmjs.com/package/@kszongic/url-status-cli) - Check HTTP status codes

## License

MIT (c) 2026 kszongic
