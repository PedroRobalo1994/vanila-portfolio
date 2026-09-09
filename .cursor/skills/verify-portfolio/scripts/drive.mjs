#!/usr/bin/env node
/**
 * Drive one mapped feature against the Launch instance and write evidence.
 *
 * Usage (from repo root):
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs locale-switch
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs landing-home
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs primary-navigation
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs work-case-studies
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs writing
 *   node .cursor/skills/verify-portfolio/scripts/drive.mjs mobile-navigation
 *
 * Requires: launch.sh + doctor.sh already green. Uses Playwright from node_modules.
 */
import { chromium, selectors } from '@playwright/test';

// Portfolio templates use data-test=… (same as redesign Playwright specs).
selectors.setTestIdAttribute('data-test');
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = path.resolve(__dirname, '..');
const RUN_DIR = process.env.VERIFY_RUN_DIR || path.join(SKILL_DIR, '.run');
const STATE_FILE = path.join(RUN_DIR, 'state.env');
const BASE = '/portfolio';

function loadState() {
  if (!fs.existsSync(STATE_FILE)) {
    throw new Error(`Missing ${STATE_FILE}. Run scripts/launch.sh first.`);
  }
  const out = {};
  for (const line of fs.readFileSync(STATE_FILE, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function ariaDump(page) {
  const snapshot = await page.locator('body').ariaSnapshot();
  return typeof snapshot === 'string' ? snapshot : String(snapshot);
}

async function proof(page, evidenceDir, label) {
  ensureDir(evidenceDir);
  const shot = path.join(evidenceDir, `${label}.png`);
  const aria = path.join(evidenceDir, `${label}.aria.txt`);
  await page.screenshot({ path: shot, fullPage: true });
  fs.writeFileSync(aria, await ariaDump(page), 'utf8');
  const meta = {
    label,
    url: page.url(),
    capturedAt: new Date().toISOString(),
    title: await page.title(),
  };
  fs.writeFileSync(path.join(evidenceDir, `${label}.meta.json`), JSON.stringify(meta, null, 2));
  console.log(`Evidence: ${shot}`);
  console.log(`Evidence: ${aria}`);
}

function assertUrl(page, suffix) {
  const url = page.url();
  if (!url.includes(suffix)) {
    throw new Error(`Expected URL to include ${suffix}, got ${url}`);
  }
}

async function driveLandingHome(page, evidenceDir) {
  await page.goto(`${BASE}/`);
  await page.getByTestId('hero').waitFor({ state: 'visible' });
  await page.getByTestId('wordmark').waitFor({ state: 'visible' });
  assertUrl(page, `${BASE}/`);
  const lang = await page.locator('html').getAttribute('lang');
  if (lang !== 'en') throw new Error(`Expected html lang=en, got ${lang}`);
  await proof(page, evidenceDir, '01-landing');

  await page.getByTestId('cta-work').click();
  assertUrl(page, `${BASE}/work/`);
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '02-cta-work');
}

async function drivePrimaryNavigation(page, evidenceDir) {
  await page.goto(`${BASE}/`);
  const nav = page.getByRole('navigation', { name: 'Primary' }).first();
  await nav.waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '01-home');

  const destinations = [
    ['Work', `${BASE}/work/`, '02-work'],
    ['Writing', `${BASE}/writing/`, '03-writing'],
    ['About', `${BASE}/about/`, '04-about'],
  ];

  for (const [name, pathname, label] of destinations) {
    await page.goto(`${BASE}/`);
    const link = nav.getByRole('link', { name, exact: true });
    await link.click();
    assertUrl(page, pathname);
    await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
    await proof(page, evidenceDir, label);
  }
}

async function driveLocaleSwitch(page, evidenceDir) {
  await page.goto(`${BASE}/`);
  await page.getByTestId('hero').waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '01-en-home');

  const toPt = page.locator('[data-test="desktop-navigation"] [data-test="lang-switch"]');
  await toPt.click();
  assertUrl(page, `${BASE}/pt/`);
  const langPt = await page.locator('html').getAttribute('lang');
  if (langPt !== 'pt') throw new Error(`Expected html lang=pt, got ${langPt}`);
  const storedPt = await page.evaluate(() => localStorage.getItem('portfolio:locale'));
  if (storedPt !== 'pt') throw new Error(`Expected localStorage portfolio:locale=pt, got ${storedPt}`);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Trabalho', exact: true }).waitFor({
    state: 'visible',
  });
  await proof(page, evidenceDir, '02-pt-home');

  const toEn = page.locator('[data-test="desktop-navigation"] [data-test="lang-switch"]');
  await toEn.click();
  assertUrl(page, `${BASE}/`);
  const langEn = await page.locator('html').getAttribute('lang');
  if (langEn !== 'en') throw new Error(`Expected html lang=en after switch back, got ${langEn}`);
  const storedEn = await page.evaluate(() => localStorage.getItem('portfolio:locale'));
  if (storedEn !== 'en') throw new Error(`Expected localStorage portfolio:locale=en, got ${storedEn}`);
  await proof(page, evidenceDir, '03-en-again');
}

async function driveWorkCaseStudies(page, evidenceDir) {
  await page.goto(`${BASE}/`);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Work', exact: true }).click();
  assertUrl(page, `${BASE}/work/`);
  await page.getByTestId('work-card-cuf-prepara').waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '01-work-index');

  await page.getByTestId('work-card-cuf-prepara').getByRole('link').first().click();
  assertUrl(page, `${BASE}/work/cuf-prepara/`);
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '02-case-study');
}

async function driveWriting(page, evidenceDir) {
  await page.goto(`${BASE}/`);
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Writing', exact: true }).click();
  assertUrl(page, `${BASE}/writing/`);
  await page.getByRole('heading', { level: 1 }).waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '01-writing-index');

  const firstArticle = page.locator('.writing-card__title a').first();
  await firstArticle.waitFor({ state: 'visible' });
  const title = await firstArticle.innerText();
  await firstArticle.click();
  assertUrl(page, `${BASE}/writing/`);
  await page.getByRole('heading', { level: 1, name: title }).waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '02-article');
}

async function driveMobileNavigation(page, evidenceDir) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`);
  const toggle = page.getByTestId('nav-toggle');
  const mobileNav = page.getByTestId('mobile-navigation');
  await toggle.waitFor({ state: 'visible' });
  if ((await toggle.getAttribute('aria-label')) !== 'Open menu') {
    throw new Error('Expected Open menu accessible name');
  }
  await proof(page, evidenceDir, '01-closed');

  await toggle.click();
  if ((await toggle.getAttribute('aria-expanded')) !== 'true') {
    throw new Error('Expected aria-expanded=true after open');
  }
  await mobileNav.waitFor({ state: 'visible' });
  await proof(page, evidenceDir, '02-open');

  await page.keyboard.press('Escape');
  if ((await toggle.getAttribute('aria-expanded')) !== 'false') {
    throw new Error('Expected aria-expanded=false after Escape');
  }
  await mobileNav.waitFor({ state: 'hidden' });
  await proof(page, evidenceDir, '03-closed-escape');
}

const drivers = {
  'landing-home': driveLandingHome,
  'primary-navigation': drivePrimaryNavigation,
  'locale-switch': driveLocaleSwitch,
  'work-case-studies': driveWorkCaseStudies,
  writing: driveWriting,
  'mobile-navigation': driveMobileNavigation,
};

async function main() {
  const feature = process.argv[2];
  if (!feature || !drivers[feature]) {
    console.error(`Usage: drive.mjs <${Object.keys(drivers).join('|')}>`);
    process.exit(2);
  }

  const state = loadState();
  const baseURL = `http://${state.HOST || '127.0.0.1'}:${state.PORT}`;
  const evidenceDir = path.join(SKILL_DIR, 'evidence', feature);
  ensureDir(evidenceDir);

  for (const f of fs.readdirSync(evidenceDir)) {
    if (f === '.gitkeep') continue;
    fs.rmSync(path.join(evidenceDir, f), { recursive: true, force: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 1280, height: 800 },
    locale: 'en-US',
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30_000);

  const runtimeErrors = [];
  page.on('pageerror', (e) => runtimeErrors.push(e.message));

  try {
    console.log(`Driving feature=${feature} at ${baseURL}${BASE}/`);
    await drivers[feature](page, evidenceDir);
    if (runtimeErrors.length) {
      throw new Error(`Page errors during drive: ${runtimeErrors.join(' | ')}`);
    }
    fs.writeFileSync(
      path.join(evidenceDir, 'PASS.json'),
      JSON.stringify({ feature, baseURL, basePath: BASE, passedAt: new Date().toISOString() }, null, 2),
    );
    console.log(`PASS ${feature}`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
