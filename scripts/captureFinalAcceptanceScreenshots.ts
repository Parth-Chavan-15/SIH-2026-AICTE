import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const screenshotsDir = path.resolve('docs/final_acceptance/screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('Launching headless Chrome on http://127.0.0.1:3000...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = path.resolve(process.env.TEMP || 'C:\\TEMP', 'chrome_cdp_fa_' + Date.now());

  const chromeProc = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9222',
    `--user-data-dir=${userDataDir}`,
    '--disable-gpu',
    '--no-sandbox',
    '--window-size=1440,900',
    'http://127.0.0.1:3000'
  ]);

  try {
    await sleep(4000);

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

    async function navigate(url: string) {
      await send('Page.navigate', { url });
      await sleep(3500);
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

    async function logout() {
      await evalJs(`
        (async () => {
          await fetch('/api/v1/auth/logout', { method: 'POST' });
          window.location.reload();
        })()
      `);
      await sleep(2500);
    }

    // 1. Session Gate / Gateway Landing (Unauthenticated)
    console.log('Capturing 01_gateway_landing.png...');
    await sleep(2000);
    await capture('01_gateway_landing.png');

    // 2. NSWS Step 4 - Route pre-check
    console.log('Navigating to NSWS simulation view...');
    await evalJs(`
      const btn = Array.from(document.querySelectorAll('button, a')).find(el => el.textContent && el.textContent.includes('NSWS Ingestion Simulation'));
      if (btn) btn.click();
    `);
    await sleep(3000);

    // Click on COEP preset and proceed to Step 4
    await evalJs(`
      const coepBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent && el.textContent.includes('COEP Tech Univ'));
      if (coepBtn) coepBtn.click();
    `);
    await sleep(1500);

    // Click Step 4 Route in stepper
    await evalJs(`
      const step4 = Array.from(document.querySelectorAll('button')).find(el => el.textContent && el.textContent.includes('Route Determination'));
      if (step4) step4.click();
    `);
    await sleep(2500);
    await capture('02_nsws_step4_route.png');

    // 3. NSWS Step 5 - Receipt
    await evalJs(`
      const step5 = Array.from(document.querySelectorAll('button')).find(el => el.textContent && el.textContent.includes('Submission & Injection'));
      if (step5) step5.click();
    `);
    await sleep(2500);
    await capture('03_nsws_step5_receipt.png');

    // 4. NSWS Duplicate Banner
    await evalJs(`
      const subBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent && el.textContent.includes('Submit Application to AICTE Portal'));
      if (subBtn) subBtn.click();
    `);
    await sleep(3000);
    await capture('04_nsws_duplicate_banner.png');

    // 5. Route Demonstration Explorer
    await evalJs(`
      const expBtn = Array.from(document.querySelectorAll('button')).find(el => el.textContent && el.textContent.includes('Statutory Route Demonstration Explorer'));
      if (expBtn) expBtn.click();
    `);
    await sleep(2500);
    await capture('05_route_demonstration_explorer.png');

    // 6. Role 1: COEP Applicant Workspace
    await loginAs('principal@coep.ac.in');
    await capture('06_coep_tenant_isolation.png');

    // 7. Role 2: Scrutiny Committee Workspace with Scope Lock
    await loginAs('scrutiny.reviewer@aicte.gov.in');
    await capture('07_scrutiny_scope_lock.png');

    // 8. Role 3: EVC Committee Portal
    await loginAs('evc.chair@aicte.gov.in');
    await capture('08_evc_inspection_dossier.png');

    // 9. Role 4: Regional Office Desk & Pendency Matrix
    await loginAs('ro.western@aicte.gov.in');
    await capture('09_ro_desk_allocation.png');

    // 10. Role 5: Approval Bureau Decision Chamber
    await loginAs('bureau.approval@aicte.gov.in');
    await capture('10_ca_speaking_order.png');

    // 11. Role 6: Policy Administration & Tamper-Evident Audit Ledger (Verified)
    await loginAs('superadmin@aicte.gov.in');
    await evalJs(`
      const navItem = Array.from(document.querySelectorAll('a, button')).find(el => el.textContent && el.textContent.includes('Audit Ledger'));
      if (navItem) navItem.click();
    `);
    await sleep(3000);
    await capture('11_audit_tamper_verified.png');

    // 12. Negative test fixture tamper detected view
    await evalJs(`
      window.scrollTo(0, document.body.scrollHeight);
    `);
    await sleep(1500);
    await capture('12_audit_tamper_detected.png');

    ws.close();
    console.log('All 12 final acceptance screenshots successfully captured!');
  } finally {
    chromeProc.kill('SIGKILL');
  }
}

run().catch(console.error);
