import json
import pathlib
import sqlite3
import time
import urllib.request

db = pathlib.Path.home() / '.cursor-byok-v3/cursor-byok.db'
deadline = time.monotonic() + 90
while time.monotonic() < deadline:
    try:
        with sqlite3.connect(f'file:{db}?mode=ro', uri=True) as connection:
            value = connection.execute("SELECT value_json FROM service_settings WHERE setting_key='network_ports'").fetchone()
        port = json.loads(value[0])['service_port']
        with urllib.request.urlopen(f'http://127.0.0.1:{port}/__byok-api__/healthz', timeout=3) as response:
            assert response.status == 204
        print('Packaged Mac app started; local backend health returned 204.')
        break
    except Exception:
        time.sleep(1)
else:
    raise SystemExit('Packaged application failed to become healthy within 90 seconds.')
