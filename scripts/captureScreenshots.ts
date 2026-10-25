import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const screenshotsDir = path.resolve('docs/assets/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome on http://localhost:3000...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(process.env.TEMP || 'C:\\TEMP', 'chrome_cdp_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://localhost:3000'
  ]);

  try {
    await sleep(3500);

    const listRes = await fetch('http://127.0.0.1:9222/json/list');
    const list = await listRes.json();
    const pageTarget = list.find((t: any) => t.type === 'page') || list[0];
    if (!pageTarget) throw new Error('No page target found');

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map<number, (res: any) => void>();

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data.toString());
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)!(msg.result);
        callbacks.delete(msg.id);
      }
    };

    await new Promise(resolve => ws.onopen = resolve);

    function send(method: string, params: any = {}): Promise<any> {
      return new Promise((resolve) => {
        const reqId = id++;
        callbacks.set(reqId, resolve);
        ws.send(JSON.stringify({ id: reqId, method, params }));
      });
    }

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false
    });

    async function evalJs(expr: string) {
      return send('Runtime.evaluate', { expression: expr, awaitPromise: true });
    }

    async function capture(filename: string) {
      const res = await send('Page.captureScreenshot', { format: 'png' });
      const filePath = path.join(screenshotsDir, filename);
      fs.writeFileSync(filePath, Buffer.from(res.data, 'base64'));
      console.log(`Saved screenshot: ${filename} (${(res.data.length * 0.75 / 1024).toFixed(1)} KB)`);
    }

    async function loginAs(email: string) {
      console.log(`Authenticating as ${email}...`);
      await evalJs(`
        (async () => {
          await fetch('/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: '${email}', password: 'password123' })
          });
          window.location.reload();
        })()
      `);
      await sleep(3500);
    }

    // 1. Session Gate / Sign-In Portal (Clean unauthenticated view)
    console.log('Capturing Session Gate...');
    await sleep(3000);
    await capture('01-session-gate-login.png');

    // 2. Role 2: Desk Scrutiny Committee Cell
    await loginAs('scrutiny.reviewer@aicte.gov.in');
    await capture('02-scrutiny-checklist.png');

    // 3. Differential Re-Scrutiny (Scope Lock USP B06)
    console.log('Switching to Differential Re-Scrutiny tab...');
    await evalJs(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Differential Re-Scrutiny'));
      if (btn) btn.click();
    `);
    await sleep(2500);
    await capture('03-differential-rescrutiny-scopelock.png');

    // 4. Role 3: EVC Committee Portal
    await loginAs('evc.chair@aicte.gov.in');
    await capture('04-evc-management.png');

    // 5. Role 4: Regional Desk & Pendency Matrix
    await loginAs('ro.western@aicte.gov.in');
    await capture('05-regional-pendency-matrix.png');

    // 6. Role 5: Approval Bureau Statutory Decision Gate
    await loginAs('bureau.approval@aicte.gov.in');
    await capture('06-statutory-decision-gate.png');

    // 7. National Ecosystem Adapters
    console.log('Switching to National Ecosystem & Siebel Dispatch tab...');
    await evalJs(`
      const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('National Ecosystem'));
      if (btn) btn.click();
    `);
    await sleep(2500);
    await capture('07-national-adapters.png');

    // 8. Role 1: Applicant Portal (COEP / GIITS)
    await loginAs('principal@coep.ac.in');
    await capture('08-applicant-portal.png');

    ws.close();
    console.log('All authentic screenshots captured successfully!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch(console.error);
