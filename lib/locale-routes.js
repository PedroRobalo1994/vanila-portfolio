'use strict';

const path = require('node:path');

/**
 * Locale routing — single source of truth for public path strings (without
 * Eleventy pathPrefix). Today: `en` at root `/`, `pt` under `/pt/`.
 */

const LOCALE_CONFIG = [
  {
    code: 'en',
    default: true,
    home: '/',
    sections: {
      home: '/',
      work: { href: '/work/', segment: 'work/' },
      writing: { href: '/writing/', segment: 'writing/' },
      about: { href: '/about/', segment: 'about/' },
    },
    content: {
      'case-study': { directoryParts: ['work'], permalinkPrefix: '/work/' },
      writing: { directoryParts: ['writing'], permalinkPrefix: '/writing/' },
    },
  },
  {
    code: 'pt',
    default: false,
    home: '/pt/',
    sections: {
      home: '/pt/',
      work: { href: '/pt/trabalho/', segment: 'trabalho/' },
      writing: { href: '/pt/escrita/', segment: 'escrita/' },
      about: { href: '/pt/sobre/', segment: 'sobre/' },
    },
    content: {
      'case-study': {
        directoryParts: ['pt', 'trabalho'],
        permalinkPrefix: '/pt/trabalho/',
      },
      writing: {
        directoryParts: ['pt', 'escrita'],
        permalinkPrefix: '/pt/escrita/',
      },
    },
  },
];

const LOCALES = LOCALE_CONFIG.map(({ code, default: isDefault }) => ({
  code,
  default: isDefault,
}));

const SECTION_KEYS = new Set(['home', 'work', 'writing', 'about']);
const CONTENT_TYPES = new Set(['case-study', 'writing']);

function getLocales() {
  return LOCALES.map((locale) => ({ ...locale }));
}

function requireLocale(locale) {
  const config = LOCALE_CONFIG.find((entry) => entry.code === locale);
  if (!config) {
    throw new Error(`Unknown locale: ${locale}`);
  }
  return config;
}

function homeHref(locale) {
  return requireLocale(locale).home;
}

function sectionHref(locale, section) {
  if (!SECTION_KEYS.has(section)) {
    throw new Error(`Unknown section: ${section}`);
  }
  const config = requireLocale(locale);
  if (section === 'home') {
    return config.sections.home;
  }
  return config.sections[section].href;
}

function permalinkPrefix(locale, contentType) {
  if (!CONTENT_TYPES.has(contentType)) {
    throw new Error(`Unknown content type: ${contentType}`);
  }
  return requireLocale(locale).content[contentType].permalinkPrefix;
}

/**
 * Directory definitions for content validation (relative to `src/`).
 * Mirrors historical CONTENT_DIRECTORIES shape.
 */
function getContentDirectories() {
  const directories = [];
  for (const config of LOCALE_CONFIG) {
    for (const [kind, definition] of Object.entries(config.content)) {
      directories.push({
        directory: path.join(...definition.directoryParts),
        locale: config.code,
        kind,
      });
    }
  }
  return directories;
}

/**
 * Permalink prefix map keyed as `${locale}:${kind}` (validate-content).
 */
function getPermalinkPrefixes() {
  return new Map(
    getContentDirectories().map(({ locale, kind }) => [
      `${locale}:${kind}`,
      permalinkPrefix(locale, kind),
    ])
  );
}

/**
 * Cascaded Eleventy data shape for `*.11tydata.js` files.
 */
function localePageData(locale) {
  const config = requireLocale(locale);
  return {
    locale: config.code,
    localePath: config.home,
    workPath: config.sections.work.segment,
    writingPath: config.sections.writing.segment,
    aboutPath: config.sections.about.segment,
  };
}

/**
 * Language switcher target URL — same semantics as the former Eleventy filter.
 */
function languageHref({
  pages = [],
  translationKey,
  targetLocale,
  pageType,
  fallbackHref,
  writingIndexOther,
}) {
  if (translationKey) {
    const match = pages.find(
      (item) =>
        item.data.translationKey === translationKey &&
        item.data.locale === targetLocale &&
        item.data.draft !== true
    );
    if (match?.url) return match.url;
    if (pageType === 'writing-detail') return writingIndexOther;
  } else if (pageType === 'writing-detail') {
    return writingIndexOther;
  }
  return fallbackHref;
}

/**
 * Case study URL for a projectKey + locale, or null.
 */
function caseStudyUrl({ caseStudies = [], projectKey, locale }) {
  const match = caseStudies.find(
    (item) =>
      item.data.projectKey === projectKey &&
      item.data.locale === locale &&
      item.data.draft !== true
  );
  return match ? match.url : null;
}

module.exports = {
  LOCALES,
  getLocales,
  homeHref,
  sectionHref,
  permalinkPrefix,
  getContentDirectories,
  getPermalinkPrefixes,
  localePageData,
  languageHref,
  caseStudyUrl,
};
