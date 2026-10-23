/** REAL_BROWSER + externally approved backend. NOT run by Vitest. No server/DB startup.
 * Requires separately installed playwright and approved fictional identities in a private file.
 * No traces/screenshots/passwords are recorded by this runner.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { realpath, stat } from 'node:fs/promises';
import { isAbsolute, relative, sep, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const repository=resolve(fileURLToPath(new URL('../..',import.meta.url)));
function browserConfig(env) {
  if(env.SIH_BROWSER_APPROVAL !== 'approved-fictional-stage6')throw Error('Exact separate browser approval flag required');
  if(env.SIH_BROWSER_ORIGIN !== 'http://127.0.0.1:3000')throw Error('Browser target must be the separately approved loopback backend');
  if(typeof env.SIH_BROWSER_IDENTITY_FILE !== 'string' || !isAbsolute(env.SIH_BROWSER_IDENTITY_FILE))throw Error('Absolute private fictional identity path required');
  return {origin:env.SIH_BROWSER_ORIGIN,identityFile:env.SIH_BROWSER_IDENTITY_FILE};
}
function outsideRepository(root,path) {
  const fromRoot=relative(root,path);
  return isAbsolute(fromRoot) || fromRoot==='..' || fromRoot.startsWith('..'+sep);
}
function fictionalAccount(account) {
  if(!account || typeof account!=='object' || Array.isArray(account) || Object.keys(account).sort().join(',')!=='email,institutionId,otherCaseId,password' || typeof account.email!=='string' || !/^[^@\s]+@demo\.invalid$/i.test(account.email) || typeof account.password!=='string' || !account.password.trim() || !['institutionId','otherCaseId'].every(k=>typeof account[k]==='string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/.test(account[k])))throw Error('Incomplete fictional browser fixture');
  return account;
}
test('HARNESS_ONLY browser configuration rejects unsafe targets and malformed fixtures',()=>{
  const valid={SIH_BROWSER_APPROVAL:'approved-fictional-stage6',SIH_BROWSER_ORIGIN:'http://127.0.0.1:3000',SIH_BROWSER_IDENTITY_FILE:resolve(repository,'..','private-stage6.json')};
  assert.equal(browserConfig(valid).origin,valid.SIH_BROWSER_ORIGIN);
  for(const flag of [undefined,'','yes'])assert.throws(()=>browserConfig({...valid,SIH_BROWSER_APPROVAL:flag}));
  for(const origin of ['http://localhost:3000','https://127.0.0.1:3000','http://127.0.0.1:3000/','http://127.0.0.1:3000.evil.invalid'])assert.throws(()=>browserConfig({...valid,SIH_BROWSER_ORIGIN:origin}));
  assert.throws(()=>browserConfig({...valid,SIH_BROWSER_IDENTITY_FILE:'fixture.json'}));
  assert.equal(outsideRepository(repository,resolve(repository,'private.json')),false);
  assert.equal(outsideRepository(repository,repository),false);
  assert.equal(outsideRepository(repository,valid.SIH_BROWSER_IDENTITY_FILE),true);
  // Invalid fixtures need no passwords, real accounts or private file reads.
  for(const fixture of [null,[],{}, {email:17}, {email:'operator@example.com'}, {email:'@demo.invalid'}, {email:'user@demo.invalid',password:''}])assert.throws(()=>fictionalAccount(fixture),/Incomplete fictional browser fixture/);
});
test('REAL_BROWSER institution journey, refresh, isolation and logout', { skip:process.env.SIH_BROWSER_APPROVAL === undefined }, async()=>{
  let browser, failure;
  let stage='configuration';
  try {
  const {origin,identityFile}=browserConfig(process.env);
  let account;
  try {
    const privatePath=await realpath(identityFile), actualRoot=await realpath(repository);
    if(!outsideRepository(actualRoot,privatePath) || !(await stat(privatePath)).isFile())throw Error();
    account=fictionalAccount(JSON.parse(await readFile(privatePath,'utf8')));
  }catch{throw Error('Unable to load an external private fictional identity file');}
  stage='optional tooling and browser startup';
  const { chromium }=await import('playwright'); // no downloader or npx fallback
  browser=await chromium.launch({headless:true});
    stage='backend login';
    const context=await browser.newContext({serviceWorkers:'block'});
    // A redirect/remote asset must not send fixture material outside the reviewed origin.
    await context.route('**/*',route=>new URL(route.request().url()).origin===origin ? route.continue() : route.abort());
    const page=await context.newPage();
    await page.goto(origin);
    assert.equal(new URL(page.url()).origin,origin);
    try {
      await page.getByLabel('Email',{exact:true}).fill(account.email);
      await page.getByLabel('Password',{exact:true}).fill(account.password);
    } catch { throw Error('Unable to enter private fictional identity'); }
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await page.getByRole('navigation',{name:'Workspace'}).waitFor();
    stage='browser cookie attributes and refresh';
    const cookies=await context.cookies(origin+'/api/v1');const cookie=cookies.find(c=>c.name==='sih_demo_session');
    assert.ok(cookie?.httpOnly);assert.equal(cookie.sameSite,'Strict');assert.equal(cookie.path,'/api/v1');
    // Secure=false is expected only for this exact HTTP loopback fixture, not deployment.
    assert.equal(cookie.secure,false);
    await page.reload();await page.getByRole('heading',{name:'New application',exact:true}).waitFor();
    stage='canonical intake and review explanation';
    await page.getByLabel('Institution ID',{exact:true}).fill(account.institutionId);
    await page.getByLabel('Proposed seats',{exact:true}).fill('320');
    const [response]=await Promise.all([
      page.waitForResponse(r=>r.url()===origin+'/api/v1/applications' && r.request().method()==='POST'),
      page.getByRole('button',{name:'Submit intake',exact:true}).click(),
    ]);
    assert.equal(response.status(),201);const body=await response.json();assert.equal(body.success,true);
    assert.equal(body.data.application.state,'policy_review_required');
    assert.equal(typeof body.data.application.id,'string');
    await page.getByText('Policy review required — this is not rejection.',{exact:true}).waitFor();
    assert.equal(await page.getByRole('button',{name:'Submit human decision'}).count(),0);
    stage='server scope and permission denial';
    const other=await page.evaluate(async id=>(await fetch('/api/v1/applications/'+encodeURIComponent(id))).status,account.otherCaseId);
    assert.equal(other,404);
    // Use the just-created in-scope case: a nonexistent ID cannot establish this boundary.
    const denied=await page.evaluate(async id=>{const r=await fetch('/api/v1/applications/'+encodeURIComponent(id)+'/decisions',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});return r.status;},body.data.application.id);
    assert.equal(denied,403);
    stage='pending integration navigation';
    await page.getByRole('button',{name:'Documents (pending)',exact:true}).click();await page.getByText('Integration pending — M3',{exact:true}).waitFor();
    assert.equal(await page.locator('form').count(),0);
    stage='logout, cookie removal and anonymous denial';
    await page.getByRole('button',{name:'Sign out',exact:true}).click();await page.getByRole('heading',{name:'Fictional demonstration sign-in'}).waitFor();
    assert.equal(await page.evaluate(async()=>(await fetch('/api/v1/applications')).status),401);
    assert.equal((await context.cookies(origin+'/api/v1')).some(c=>c.name==='sih_demo_session'),false);
    await context.close();
  }catch { failure=Error(`Browser acceptance failed during ${stage}; private fixture and browser details suppressed`); }
  finally { try { await browser?.close(); } catch { failure ??= Error('Browser cleanup failed; private details suppressed'); } }
  if(failure)throw failure;
});
