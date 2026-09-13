const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');

async function main() {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), 'byok-mac-cli-smoke-'));
  const data = path.join(home, '.cursor-byok-v3');
  fs.mkdirSync(path.join(data, 'ca'), { recursive: true });
  fs.writeFileSync(path.join(data, 'ca', 'ca.crt'), '');
  const versions = path.join(home, '.local/share/cursor-agent/versions');
  fs.mkdirSync(versions, { recursive: true });
  fs.symlinkSync(path.resolve(process.argv[2]), path.join(versions, '2026.09.10-fd3934a'));
  const server = http.createServer((request, response) => {
    if (request.url !== '/__byok-api__/api/harness/cursor/status') {
      response.writeHead(404).end();
      return;
    }
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ integration: 'enabled', proxy_url: `http://127.0.0.1:${server.address().port}` }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const db = new DatabaseSync(path.join(data, 'cursor-byok.db'));
    db.exec('CREATE TABLE service_settings (setting_key TEXT, value_json TEXT)');
    db.prepare('INSERT INTO service_settings VALUES (?, ?)').run('network_ports', JSON.stringify({ service_port: server.address().port }));
    db.close();
    const child = spawn('bash', [path.resolve('support/cursor-cli/cursor-byok'), '--version'], { env: { ...process.env, HOME: home } });
    let output = '';
    child.stdout.on('data', chunk => { output += chunk; });
    child.stderr.on('data', chunk => { output += chunk; });
    const timer = setTimeout(() => child.kill(), 30000);
    const code = await new Promise((resolve, reject) => { child.on('error', reject); child.on('exit', resolve); });
    clearTimeout(timer);
    assert.equal(code, 0, output);
    assert.match(output, /2026\.09\.10-fd3934a/);
    const config = JSON.parse(fs.readFileSync(path.join(data, 'cli/cli-config.json'), 'utf8'));
    assert.equal(config.approvalMode, 'allowlist');
    assert.equal(config.sandbox?.mode, undefined);
    console.log('Official Mac CLI starts through launcher; isolated allowlist config verified.');
  } finally {
    server.close();
    assert.equal(path.dirname(path.resolve(home)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(home).startsWith('byok-mac-cli-smoke-'));
    fs.rmSync(home, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
