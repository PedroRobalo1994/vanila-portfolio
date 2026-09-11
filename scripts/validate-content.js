const fs = require('node:fs/promises');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const FRONT_MATTER_OPTIONS = {
  engines: {
    yaml: (source) => yaml.load(source, { schema: yaml.JSON_SCHEMA }),
  },
};

const {
  getContentDirectories,
  getPermalinkPrefixes,
} = require('../lib/locale-routes');

const CONTENT_DIRECTORIES = getContentDirectories();

const CONTENT_TYPES = new Set(['article', 'note', 'case-study']);
const TRANSLATION_KEY_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const PERMALINK_PREFIXES = getPermalinkPrefixes();

function hasText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidDate(value) {
  if (typeof value !== 'string') return false;

  const match = DATE_PATTERN.exec(value);
  if (!match) return false;

  const [, yearText, monthText, dayText] = match;
  const [year, month, day] = [yearText, monthText, dayText].map(Number);
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  date.setUTCHours(0, 0, 0, 0);

  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function describe(document) {
  return document.filePath || '<unknown file>';
}

function validateDocument(document) {
  const { data, kind, locale } = document;
  const file = describe(document);
  const errors = [];

  for (const field of ['layout', 'translationKey', 'title', 'summary']) {
    if (!hasText(data[field])) errors.push(`${file}: ${field} must be a non-empty string`);
  }

  if (!CONTENT_TYPES.has(data.contentType)) {
    errors.push(`${file}: contentType must be article, note, or case-study`);
  }

  if (data.locale !== locale) {
    errors.push(`${file}: locale must resolve to ${locale} for this directory`);
  }

  if (hasText(data.translationKey) && !TRANSLATION_KEY_PATTERN.test(data.translationKey)) {
    errors.push(`${file}: translationKey must use lowercase kebab-case`);
  }

  if (typeof data.featured !== 'boolean') {
    errors.push(`${file}: featured must be a boolean`);
  }

  if (typeof data.draft !== 'boolean') {
    errors.push(`${file}: draft must be a boolean`);
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0 || !data.tags.every(hasText)) {
    errors.push(`${file}: tags must be a non-empty array of strings`);
  }

  if (data.draft === true && data.permalink !== false) {
    errors.push(`${file}: draft content must set permalink to false`);
  }

  if (data.draft === false && !hasText(data.permalink)) {
    errors.push(`${file}: published content must define a permalink`);
  }

  if (data.draft === false && hasText(data.permalink)) {
    const expectedPrefix = PERMALINK_PREFIXES.get(`${locale}:${kind}`);
    if (expectedPrefix && !data.permalink.startsWith(expectedPrefix)) {
      errors.push(`${file}: published permalink must start with ${expectedPrefix}`);
    }
  }

  if (kind === 'case-study') {
    if (data.contentType !== 'case-study') {
      errors.push(`${file}: files in a Work directory must use contentType case-study`);
    }
    if (!hasText(data.projectKey)) errors.push(`${file}: projectKey must be a non-empty string`);
    if (typeof data.sanitized !== 'boolean') errors.push(`${file}: sanitized must be a boolean`);
    if (!Number.isInteger(data.order) || data.order < 1) {
      errors.push(`${file}: order must be a positive integer`);
    }
    if (!Array.isArray(data.tags) || !data.tags.includes('case-study')) {
      errors.push(`${file}: Case Studies must include the case-study tag`);
    }
  }

  if (kind === 'writing') {
    if (!['article', 'note'].includes(data.contentType)) {
      errors.push(`${file}: files in a Writing directory must use contentType article or note`);
    }
    if (!isValidDate(data.date)) {
      errors.push(`${file}: date must use a valid YYYY-MM-DD calendar date`);
    }
    if (!Array.isArray(data.tags) || !data.tags.includes('writing')) {
      errors.push(`${file}: Writing must include the writing tag`);
    }
  }

  return errors;
}

function validateTranslationKeys(documents) {
  const errors = [];
  const identities = new Map();
  const groups = new Map();

  for (const document of documents) {
    const { data } = document;
    if (!hasText(data.translationKey) || !hasText(data.locale)) continue;

    const identity = `${data.locale}:${data.translationKey}`;
    const existing = identities.get(identity);
    if (existing) {
      errors.push(
        `${describe(document)}: duplicate translation identity ${identity}; already used by ${describe(existing)}`
      );
    } else {
      identities.set(identity, document);
    }

    const group = groups.get(data.translationKey) || [];
    group.push(document);
    groups.set(data.translationKey, group);
  }

  for (const [translationKey, group] of groups) {
    if (group.length < 2) continue;

    const contentTypes = new Set(group.map(({ data }) => data.contentType));
    if (contentTypes.size > 1) {
      errors.push(`${translationKey}: translated counterparts must use the same contentType`);
    }

    if (group.some(({ kind }) => kind === 'case-study')) {
      const projectKeys = new Set(group.map(({ data }) => data.projectKey));
      if (projectKeys.size > 1) {
        errors.push(`${translationKey}: translated Case Studies must use the same projectKey`);
      }
    }
  }

  return errors;
}

function validateDocuments(documents) {
  return [...documents.flatMap(validateDocument), ...validateTranslationKeys(documents)];
}

async function markdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(entryPath)));
    if (entry.isFile() && path.extname(entry.name) === '.md') files.push(entryPath);
  }

  return files;
}

async function loadContentDocuments(sourceDirectory) {
  const documents = [];

  for (const definition of CONTENT_DIRECTORIES) {
    const directory = path.join(sourceDirectory, definition.directory);
    const files = await markdownFiles(directory);

    for (const filePath of files) {
      const source = await fs.readFile(filePath, 'utf8');
      const { data } = matter(source, FRONT_MATTER_OPTIONS);
      documents.push({
        ...definition,
        filePath: path.relative(process.cwd(), filePath),
        data: { ...data, locale: data.locale ?? definition.locale },
      });
    }
  }

  return documents;
}

async function validateContent(sourceDirectory = path.join(process.cwd(), 'src')) {
  const documents = await loadContentDocuments(sourceDirectory);
  const errors = validateDocuments(documents);

  if (errors.length > 0) {
    throw new Error(`Content validation failed:\n- ${errors.join('\n- ')}`);
  }

  return documents.length;
}

if (require.main === module) {
  validateContent()
    .then((count) => console.log(`Validated ${count} content documents.`))
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}

module.exports = {
  loadContentDocuments,
  validateContent,
  validateDocument,
  validateDocuments,
  validateTranslationKeys,
};
