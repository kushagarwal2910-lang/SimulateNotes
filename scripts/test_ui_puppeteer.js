const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

async function testUserWorkflow() {
  console.log('[Test] Launching Chrome...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    console.log(`[Browser Console ${msg.type().toUpperCase()}] ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.log(`[Browser Page Error] ${err.message}`);
  });

  console.log('[Test] Step 1: Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  const artifactDir = path.join(__dirname, '..', 'scratch');
  if (!fs.existsSync(artifactDir)) fs.mkdirSync(artifactDir, { recursive: true });

  await page.screenshot({ path: path.join(artifactDir, '01_home_dashboard.png') });
  console.log('[Test] Saved home dashboard screenshot to scratch/01_home_dashboard.png');

  // Step 2: Click "+ New note" to enter workspace
  console.log('[Test] Step 2: Clicking "+ New note" button...');
  await page.waitForSelector('button', { timeout: 10000 });
  
  const buttons = await page.$$('button');
  let clicked = false;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes('New note')) {
      await btn.click();
      clicked = true;
      console.log('[Test] Clicked "+ New note" button');
      break;
    }
  }

  if (!clicked) {
    throw new Error('Could not find "+ New note" button');
  }

  // Wait for workspace to appear (ChatPanel + SourcesSidebar)
  console.log('[Test] Waiting for notebook workspace to load...');
  await page.waitForSelector('form input', { timeout: 15000 });
  await page.screenshot({ path: path.join(artifactDir, '02_empty_notebook_workspace.png') });
  console.log('[Test] Saved empty workspace screenshot to scratch/02_empty_notebook_workspace.png');

  // ASSERTION: Studio should be closed by default on new note!
  const hasIframeInitially = await page.evaluate(() => !!document.querySelector('iframe'));
  console.log(`[Test Assertion] Studio iframe initially present: ${hasIframeInitially} (Expected: false)`);
  if (hasIframeInitially) {
    throw new Error('Studio iframe was found when creating a new note! Studio should be closed.');
  }

  // ASSERTION: Left nav bar showing sources should be empty
  const emptyStateText = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    return aside ? aside.innerText : '';
  });
  console.log(`[Test Assertion] Left sidebar contains "No sources indexed yet": ${emptyStateText.includes('No sources indexed yet')}`);
  if (!emptyStateText.includes('No sources indexed yet') && !emptyStateText.includes('0 sources')) {
    throw new Error('Left navbar was not empty on new note creation!');
  }

  // ASSERTION: Must not show quantum tunneling
  const fullBodyText = await page.evaluate(() => document.body.innerText);
  if (fullBodyText.includes('Quantum Tunneling') && fullBodyText.includes('Wavepacket Dynamics')) {
    throw new Error('Found irrelevant Quantum Tunneling note inside brand new note!');
  }
  console.log('[Test Assertion] Verified clean empty note: No irrelevant simulation, studio is closed, sources index is empty.');

  // Step 3: Type Bayes theorem query into chat input
  console.log('[Test] Step 3: Typing query into chat input...');
  await page.evaluate((val) => {
    const input = document.querySelector('form input');
    if (!input) throw new Error("Could not find chat input");
    const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    nativeSetter.call(input, val);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }, 'teach me about Bayes theorem and conditional probability');

  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(artifactDir, '03_query_typed_in_chat.png') });
  console.log('[Test] Saved typed query screenshot to scratch/03_query_typed_in_chat.png');

  // Submit form via requestSubmit
  console.log('[Test] Submitting query via form submission...');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (form) form.requestSubmit();
  });

  // Step 4: Wait for RAG response
  console.log('[Test] Step 4: Waiting for Tavily RAG response and simulation generation...');
  await page.waitForFunction(() => {
    const text = document.body.innerText;
    return text.includes("SIMULATENOTES RAG") || text.includes("Bayes' Theorem: Mathematical");
  }, { timeout: 35000 });

  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(artifactDir, '04_rag_response_received.png') });
  console.log('[Test] Saved RAG response screenshot to scratch/04_rag_response_received.png');

  // ASSERTION: Left sidebar should now be filled with crawled sources
  const sourceCount = await page.evaluate(() => {
    const aside = document.querySelector('aside');
    if (!aside) return 0;
    return aside.querySelectorAll('h3').length;
  });
  console.log(`[Test Assertion] Left sidebar source cards count: ${sourceCount} (Expected: > 0)`);
  if (sourceCount === 0) {
    throw new Error('Left sidebar RAG sources did not fill up after query!');
  }

  // Step 5: Verify Studio iframe
  console.log('[Test] Step 5: Checking Studio simulation iframe...');
  await page.waitForSelector('iframe', { timeout: 20000 });
  const iframeSrc = await page.$eval('iframe', el => el.src);
  console.log(`[Test] Verified simulation iframe source: ${iframeSrc}`);

  // Wait for iframe animation to render
  await new Promise(r => setTimeout(r, 5000));
  await page.screenshot({ path: path.join(artifactDir, '05_studio_bayes_simulation.png') });
  console.log('[Test] Saved Studio simulation screenshot to scratch/05_studio_bayes_simulation.png');

  // Step 6: Test Formulas tab in Studio
  console.log('[Test] Step 6: Testing Formulas tab in Studio...');
  const allButtons = await page.$$('button');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.trim() === 'Formulas') {
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(artifactDir, '06_studio_formulas_tab.png') });
      console.log('[Test] Saved Formulas tab screenshot to scratch/06_studio_formulas_tab.png');
      break;
    }
  }

  // Step 7: Test Code tab in Studio
  console.log('[Test] Step 7: Testing Code tab in Studio...');
  for (const btn of allButtons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.trim() === 'Code') {
      await btn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(artifactDir, '07_studio_code_tab.png') });
      console.log('[Test] Saved Code tab screenshot to scratch/07_studio_code_tab.png');
      break;
    }
  }

  console.log('[Test] 🎉 ALL USER WORKFLOW VERIFICATION TESTS PASSED 100%!');
  await browser.close();
}

testUserWorkflow().catch(err => {
  console.error('[Test Error]', err);
  process.exit(1);
});
