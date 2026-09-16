/**
 * Headless Execution & Test Harness Runner
 * 5-Stage Automated Sandbox Verification Engine for React + GSAP Simulations
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

// Candidate browser executable paths on Windows
const BROWSER_CANDIDATE_PATHS = [
  process.env.CHROME_PATH,
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
].filter(Boolean);

function findBrowserExecutable() {
  for (const candidate of BROWSER_CANDIDATE_PATHS) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    html: null,
    timeout: 12000,
    screenshot: null
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--html' && args[i + 1]) {
      options.html = path.resolve(args[i + 1]);
      i++;
    } else if (args[i] === '--timeout' && args[i + 1]) {
      options.timeout = parseInt(args[i + 1], 10) || 12000;
      i++;
    } else if (args[i] === '--screenshot' && args[i + 1]) {
      options.screenshot = path.resolve(args[i + 1]);
      i++;
    } else if (!args[i].startsWith('--') && !options.html) {
      options.html = path.resolve(args[i]);
    }
  }
  return options;
}

async function runHarness() {
  const startTime = Date.now();
  const options = parseArgs();

  if (!options.html || !fs.existsSync(options.html)) {
    console.log(JSON.stringify({
      passed: false,
      score: 0,
      fatal_error: `Target HTML file not found: ${options.html}`,
      errors: [`Target HTML file not found: ${options.html}`],
      stages: {}
    }));
    process.exit(0);
  }

  const result = {
    passed: false,
    score: 0,
    fatal_error: null,
    errors: [],
    warnings: [],
    stages: {
      syntax: { passed: false },
      mount: { passed: false },
      visual_scene: { passed: false, svg_count: 0, shapes_count: 0, canvas_count: 0 },
      math_invariants: { passed: false, nan_count: 0 },
      fuzzing: { passed: false, sliders_tested: 0, buttons_tested: 0 }
    },
    elapsed_ms: 0
  };

  const htmlContent = fs.readFileSync(options.html, 'utf8');

  // ----------------------------------------------------
  // Stage 1: Static Babel & Pre-flight Syntax Gate
  // ----------------------------------------------------
  const babelStandalonePath = path.resolve(__dirname, 'babel.min.js');
  if (fs.existsSync(babelStandalonePath)) {
    try {
      const Babel = require(babelStandalonePath);
      // Extract code inside script or json payload
      const sourceMatch = htmlContent.match(/const sourceCode = ([\s\S]*?);\s*try\s*\{/);
      let sourceCode = "";
      if (sourceMatch) {
        try {
          sourceCode = JSON.parse(sourceMatch[1]);
        } catch {
          sourceCode = sourceMatch[1];
        }
      }
      if (sourceCode) {
        Babel.transform(sourceCode, { presets: [['react', { runtime: 'classic' }]] });
      }
      result.stages.syntax.passed = true;
    } catch (syntaxErr) {
      result.stages.syntax.passed = false;
      result.stages.syntax.error = syntaxErr.message;
      result.errors.push(`[Stage 1: Syntax] Babel Transpilation Failed: ${syntaxErr.message}`);
      result.elapsed_ms = Date.now() - startTime;
      console.log(JSON.stringify(result));
      process.exit(0);
    }
  } else {
    result.stages.syntax.passed = true;
  }

  // ----------------------------------------------------
  // Stage 2: Headless Browser Boot & Mount Gate
  // ----------------------------------------------------
  const executablePath = findBrowserExecutable();
  if (!executablePath) {
    result.errors.push("[Stage 2: Browser] Chrome/Edge executable not found in standard system locations.");
    result.elapsed_ms = Date.now() - startTime;
    console.log(JSON.stringify(result));
    process.exit(0);
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      executablePath,
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--allow-file-access-from-files'
      ]
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });

    const pageErrors = [];
    const consoleErrors = [];

    page.on('pageerror', err => {
      pageErrors.push(err.stack || err.message);
    });

    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore favicon or benign CDN connection drops
        if (!text.includes('favicon') && !text.includes('404')) {
          consoleErrors.push(text);
        }
      }
    });

    const fileUrl = 'file:///' + options.html.replace(/\\/g, '/');
    await page.goto(fileUrl, { waitUntil: 'domcontentloaded', timeout: options.timeout });

    // Wait for React to mount into #root or an error into #error-container
    try {
      await page.waitForFunction(
        () => {
          const root = document.getElementById('root');
          const err = document.getElementById('error-container');
          return (root && root.innerHTML.trim().length > 0) || (err && err.innerHTML.trim().length > 0);
        },
        { timeout: 8000 }
      );
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }

    // Check if error-container has error content
    const errorBoxText = await page.$eval('#error-container', el => el ? el.textContent.trim() : '').catch(() => '');
    if (errorBoxText) {
      pageErrors.push(`Error Container: ${errorBoxText}`);
    }

    const rootHtml = await page.$eval('#root', el => el ? el.innerHTML.trim() : '').catch(() => '');
    if (!rootHtml) {
      pageErrors.push("React #root element is empty. Component failed to mount.");
    }

    if (pageErrors.length > 0 || consoleErrors.length > 0) {
      result.stages.mount.passed = false;
      for (const err of pageErrors) {
        result.errors.push(`[Stage 2: Mount Crash] ${err}`);
      }
      for (const err of consoleErrors) {
        result.errors.push(`[Stage 2: Console Error] ${err}`);
      }
      await browser.close();
      result.elapsed_ms = Date.now() - startTime;
      console.log(JSON.stringify(result));
      process.exit(0);
    }

    result.stages.mount.passed = true;

    if (options.screenshot) {
      try {
        await page.screenshot({ path: options.screenshot, fullPage: true });
      } catch (screenshotErr) {
        result.warnings.push(`Screenshot failed: ${screenshotErr.message}`);
      }
    }

    // ----------------------------------------------------
    // Stage 3: Visual Scene & Canvas Audit
    // ----------------------------------------------------
    const svgCount = await page.$$eval('svg', els => els.length);
    const shapesCount = await page.$$eval('svg path, svg circle, svg rect, svg line, svg polygon, svg polyline', els => els.length);
    const canvasCount = await page.$$eval('canvas', els => els.length);

    result.stages.visual_scene.svg_count = svgCount;
    result.stages.visual_scene.shapes_count = shapesCount;
    result.stages.visual_scene.canvas_count = canvasCount;

    if (svgCount === 0 && canvasCount === 0) {
      result.errors.push("[Stage 3: Visual Scene] No <svg> or <canvas> stage found in simulation output.");
    } else if (svgCount > 0 && shapesCount < 8 && canvasCount === 0) {
      result.errors.push(`[Stage 3: Visual Scene] SVG stage lacks visual density (${shapesCount} shapes). Expected rich vector scene with multi-point curves, gradients, and annotations.`);
    } else {
      // Audit for flat degenerate placeholder paths (e.g. d="M 60 280 L 860 280")
      const pathAudit = await page.$$eval('svg path', paths => {
        let flatCount = 0;
        let curvedCount = 0;
        for (const p of paths) {
          const d = (p.getAttribute('d') || '').trim();
          try {
            const bbox = p.getBBox();
            // Flag wide paths with negligible vertical amplitude
            if (bbox.width > 120 && bbox.height < 5) {
              flatCount++;
            } else if (bbox.height >= 8 || /[CSQcsq]/.test(d) || d.split(/[MLC]/).length > 5) {
              curvedCount++;
            }
          } catch {
            if (/^M\s*[-+]?\d*\.?\d+[\s,]+([-+]?\d*\.?\d+)\s+L\s*[-+]?\d*\.?\d+[\s,]+\1\s*$/i.test(d)) {
              flatCount++;
            }
          }
        }
        return { flatCount, curvedCount };
      });

      if (pathAudit.flatCount > 0 && pathAudit.curvedCount === 0) {
        result.errors.push(`[Stage 3: Visual Scene Degeneracy] Detected ${pathAudit.flatCount} flat placeholder path(s) (width > 120px with height < 5px) and 0 contoured curves. Waveforms, signals, and trajectories must have visible mathematical amplitude and geometric curvature.`);
      } else {
        result.stages.visual_scene.passed = true;
      }
    }

    // ----------------------------------------------------
    // Stage 4: Mathematical Invariant & Singularity Audit
    // ----------------------------------------------------
    const nanAttrCount = await page.$$eval('[d*="NaN"], [cx*="NaN"], [cy*="NaN"], [transform*="NaN"], [x1*="NaN"], [y1*="NaN"], [x2*="NaN"], [y2*="NaN"]', els => els.length);
    const nanTextCount = await page.$$eval('*', els => {
      let count = 0;
      for (const el of els) {
        if (el.children.length === 0 && el.textContent) {
          const t = el.textContent;
          if (/\bNaN\b/.test(t) || /\bInfinity\b/.test(t) || /\bundefined\b/.test(t)) {
            count++;
          }
        }
      }
      return count;
    });

    const totalNan = nanAttrCount + nanTextCount;
    result.stages.math_invariants.nan_count = totalNan;

    if (totalNan > 0) {
      result.errors.push(`[Stage 4: Mathematical Invariant] Mathematical singularity detected: ${totalNan} instance(s) of NaN/Infinity found in DOM attributes or telemetry values.`);
    } else {
      result.stages.math_invariants.passed = true;
    }

    // ----------------------------------------------------
    // Stage 5: Dynamic State, Motion & Interaction Fuzzing Gate
    // ----------------------------------------------------
    const fuzzingErrors = [];

    // 5A. Initial Mount Motion Audit: verify that the simulation moves or reacts to interaction
    const getVisualSnapshot = () => page.$eval('svg, canvas', el => {
      const paths = Array.from(el.querySelectorAll('path')).map(p => p.getAttribute('d') || '');
      const circles = Array.from(el.querySelectorAll('circle')).map(c => `${c.getAttribute('cx')},${c.getAttribute('cy')}`);
      return paths.slice(0, 5).join('|') + '##' + circles.slice(0, 10).join('|');
    }).catch(() => '');

    let snap1 = '';
    let snap2 = '';
    let motionDetected = true;
    try {
      snap1 = await getVisualSnapshot();
      await new Promise(r => setTimeout(r, 400));
      snap2 = await getVisualSnapshot();
      motionDetected = (snap1 && snap2 && snap1 !== snap2);
    } catch {}

    // 5B. Fuzz range sliders across boundary limits
    const sliders = await page.$$('input[type="range"]');
    result.stages.fuzzing.sliders_tested = sliders.length;

    for (let i = 0; i < sliders.length; i++) {
      const slider = sliders[i];
      try {
        const bounds = await slider.evaluate(el => ({
          min: parseFloat(el.min) || 0,
          max: parseFloat(el.max) || 100,
          val: parseFloat(el.value) || 50
        }));

        // Test Min boundary
        await slider.evaluate((el, v) => {
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, bounds.min);

        // Test Max boundary
        await slider.evaluate((el, v) => {
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, bounds.max);

        // Restore to midpoint
        const mid = (bounds.min + bounds.max) / 2;
        await slider.evaluate((el, v) => {
          el.value = v;
          el.dispatchEvent(new Event('input', { bubbles: true }));
          el.dispatchEvent(new Event('change', { bubbles: true }));
        }, mid);
      } catch (slideErr) {
        fuzzingErrors.push(`Slider #${i+1} interaction failed: ${slideErr.message}`);
      }
    }

    // 5C. Test button controls (Play, Pause, Reset, Toggles)
    const buttons = await page.$$('button');
    result.stages.fuzzing.buttons_tested = buttons.length;

    for (let i = 0; i < buttons.length; i++) {
      const btn = buttons[i];
      try {
        const isVisible = await btn.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).display !== 'none';
        });
        if (isVisible) {
          await btn.click();
        }
      } catch (clickErr) {
        // Ignore non-fatal click interception if disabled
      }
    }

    // Let animation settle after button tests
    await new Promise(r => setTimeout(r, 200));

    // If initial autonomous motion was not detected (e.g. simulation initialized paused), check if interactions caused stage updates
    if (!motionDetected) {
      try {
        const snapPostFuzz = await getVisualSnapshot();
        if (snapPostFuzz && snap1 && snapPostFuzz !== snap1) {
          motionDetected = true;
        }
      } catch {}
    }

    // Check if new runtime errors were thrown during fuzzing
    if (pageErrors.length > 0) {
      for (const err of pageErrors) {
        fuzzingErrors.push(`[Post-Fuzz Crash] ${err}`);
      }
    }

    if (fuzzingErrors.length > 0) {
      for (const err of fuzzingErrors) {
        result.errors.push(`[Stage 5: Fuzzing] ${err}`);
      }
    } else if (motionDetected || sliders.length > 0) {
      result.stages.fuzzing.passed = true;
    } else {
      result.warnings.push("[Stage 5: Animation Warning] Simulation stage is static (zero autonomous motion detected).");
      result.stages.fuzzing.passed = true;
    }

    await browser.close();

  } catch (browserErr) {
    if (browser) {
      try { await browser.close(); } catch {}
    }
    result.errors.push(`[Browser Runner Exception] ${browserErr.message}`);
  }

  // Final Scoring & Verdict
  const allStagesPassed = (
    result.stages.syntax.passed &&
    result.stages.mount.passed &&
    result.stages.visual_scene.passed &&
    result.stages.math_invariants.passed &&
    result.stages.fuzzing.passed
  );

  result.passed = allStagesPassed && result.errors.length === 0;

  if (result.passed) {
    result.score = 100;
  } else {
    // Deduct points based on severity
    let score = 100;
    if (!result.stages.syntax.passed) score -= 50;
    if (!result.stages.mount.passed) score -= 40;
    if (!result.stages.visual_scene.passed) score -= 20;
    if (!result.stages.math_invariants.passed) score -= 25;
    if (!result.stages.fuzzing.passed) score -= 20;
    result.score = Math.max(score - (result.errors.length * 5), 0);
  }

  result.elapsed_ms = Date.now() - startTime;
  console.log(JSON.stringify(result));
  process.exit(0);
}

runHarness().catch(err => {
  console.log(JSON.stringify({
    passed: false,
    score: 0,
    fatal_error: err.stack || err.message,
    errors: [err.message],
    stages: {}
  }));
  process.exit(0);
});
