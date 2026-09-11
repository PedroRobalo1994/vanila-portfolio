import { describe, expect, it } from 'vitest';

const {
  LOCALES,
  getLocales,
  homeHref,
  sectionHref,
  permalinkPrefix,
  getPermalinkPrefixes,
  languageHref,
  caseStudyUrl,
} = require('../../lib/locale-routes.js');

describe('locale-routes', () => {
  describe('locales', () => {
    it('exposes en (default) and pt', () => {
      expect(LOCALES).toEqual([
        { code: 'en', default: true },
        { code: 'pt', default: false },
      ]);
      expect(getLocales()).toEqual(LOCALES);
    });
  });

  describe('section map', () => {
    it('maps home, work, writing, and about for en and pt', () => {
      expect(homeHref('en')).toBe('/');
      expect(homeHref('pt')).toBe('/pt/');

      expect(sectionHref('en', 'home')).toBe('/');
      expect(sectionHref('pt', 'home')).toBe('/pt/');

      expect(sectionHref('en', 'work')).toBe('/work/');
      expect(sectionHref('pt', 'work')).toBe('/pt/trabalho/');

      expect(sectionHref('en', 'writing')).toBe('/writing/');
      expect(sectionHref('pt', 'writing')).toBe('/pt/escrita/');

      expect(sectionHref('en', 'about')).toBe('/about/');
      expect(sectionHref('pt', 'about')).toBe('/pt/sobre/');
    });
  });

  describe('permalink prefixes', () => {
    it('mirrors case-study and writing prefixes per locale', () => {
      expect(permalinkPrefix('en', 'case-study')).toBe('/work/');
      expect(permalinkPrefix('pt', 'case-study')).toBe('/pt/trabalho/');
      expect(permalinkPrefix('en', 'writing')).toBe('/writing/');
      expect(permalinkPrefix('pt', 'writing')).toBe('/pt/escrita/');

      const prefixes = getPermalinkPrefixes();
      expect(Object.fromEntries(prefixes)).toEqual({
        'en:case-study': '/work/',
        'en:writing': '/writing/',
        'pt:case-study': '/pt/trabalho/',
        'pt:writing': '/pt/escrita/',
      });
    });
  });

  describe('languageHref', () => {
    const pages = [
      {
        url: '/work/cuf-prepara/',
        data: { translationKey: 'cuf-prepara', locale: 'en', draft: false },
      },
      {
        url: '/pt/trabalho/cuf-prepara/',
        data: { translationKey: 'cuf-prepara', locale: 'pt', draft: false },
      },
      {
        url: '/writing/draft-only/',
        data: { translationKey: 'draft-only', locale: 'en', draft: true },
      },
      {
        url: '/pt/escrita/draft-only/',
        data: { translationKey: 'draft-only', locale: 'pt', draft: false },
      },
    ];

    it('returns the counterpart url when a non-draft match exists', () => {
      expect(
        languageHref({
          pages,
          translationKey: 'cuf-prepara',
          targetLocale: 'pt',
          pageType: 'case-study',
          fallbackHref: '/pt/',
          writingIndexOther: '/pt/escrita/',
        })
      ).toBe('/pt/trabalho/cuf-prepara/');
    });

    it('skips draft counterparts and uses writing-detail fallback', () => {
      expect(
        languageHref({
          pages,
          translationKey: 'draft-only',
          targetLocale: 'en',
          pageType: 'writing-detail',
          fallbackHref: '/',
          writingIndexOther: '/writing/',
        })
      ).toBe('/writing/');
    });

    it('falls back to writing index for writing-detail without a counterpart', () => {
      expect(
        languageHref({
          pages,
          translationKey: 'missing-key',
          targetLocale: 'pt',
          pageType: 'writing-detail',
          fallbackHref: '/pt/',
          writingIndexOther: '/pt/escrita/',
        })
      ).toBe('/pt/escrita/');
    });

    it('falls back to writing index for writing-detail without a translationKey', () => {
      expect(
        languageHref({
          pages,
          translationKey: undefined,
          targetLocale: 'pt',
          pageType: 'writing-detail',
          fallbackHref: '/pt/',
          writingIndexOther: '/pt/escrita/',
        })
      ).toBe('/pt/escrita/');
    });

    it('falls back to home when no counterpart and not writing-detail', () => {
      expect(
        languageHref({
          pages,
          translationKey: 'missing-key',
          targetLocale: 'pt',
          pageType: 'about',
          fallbackHref: '/pt/',
          writingIndexOther: '/pt/escrita/',
        })
      ).toBe('/pt/');
    });
  });

  describe('caseStudyUrl', () => {
    const caseStudies = [
      {
        url: '/work/dose-segura/',
        data: { projectKey: 'dose-segura', locale: 'en', draft: false },
      },
      {
        url: '/pt/trabalho/dose-segura/',
        data: { projectKey: 'dose-segura', locale: 'pt', draft: true },
      },
    ];

    it('returns the matching case study url', () => {
      expect(
        caseStudyUrl({
          caseStudies,
          projectKey: 'dose-segura',
          locale: 'en',
        })
      ).toBe('/work/dose-segura/');
    });

    it('returns null on miss or draft', () => {
      expect(
        caseStudyUrl({
          caseStudies,
          projectKey: 'dose-segura',
          locale: 'pt',
        })
      ).toBeNull();
      expect(
        caseStudyUrl({
          caseStudies,
          projectKey: 'missing',
          locale: 'en',
        })
      ).toBeNull();
    });
  });
});
