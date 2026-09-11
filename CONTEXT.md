# Portfolio

This context defines the public body of work through which Pedro presents his projects, thinking, and professional identity.

## Language

**Portfolio**:
The complete public body of work, including projects and writing. It is broader than a résumé or a single landing page.
_Avoid_: Personal website, résumé site

**Landing Page**:
The curated introduction to the Portfolio, giving visitors clear paths into selected Projects and Writing. It is not a compressed version of every page.
_Avoid_: Home section, one-page portfolio

**Work**:
The collection of selected Projects and smaller Experiments through which Pedro demonstrates his craft.
_Avoid_: Projects section, portfolio grid

**Project**:
A selected piece of work presented as evidence of craft, judgment, and outcomes.
_Avoid_: Card, item

**Case Study**:
The detailed account of a Project's context, constraints, decisions, and outcomes.
_Avoid_: Project page, showcase

**Sanitized Case Study**:
A Case Study restricted to verified, non-confidential information and stripped of patient, employer-private, internal-system, and private-source details.
_Avoid_: Full disclosure, anonymized project

**Proof Signal**:
Verifiable evidence supporting a capability claim, such as browser coverage, localized content, continuous integration, or a dated quality score.
_Avoid_: Vanity metric, claim

**Experiment**:
A smaller piece of Work preserved as evidence of curiosity or focused practice without requiring a full Case Study.
_Avoid_: Mini-project, card

**Writing**:
The collection containing Pedro's durable Articles and shorter Notes.
_Avoid_: Blog

**Article**:
A polished, structured, and durable piece of Writing that develops a substantial idea.
_Avoid_: Blog post

**Note**:
A shorter, less formal piece of Writing focused on one observation, update, or developing idea.
_Avoid_: Blog post

**Locale routing / LocaleRoutes**:
The config-driven module (`lib/locale-routes.js`) that owns public locale path strings without Eleventy `pathPrefix`: section hrefs (`home`, `work`, `writing`, `about`), content permalink prefixes, language-switch resolution (`languageHref`), and case-study URL lookup (`caseStudyUrl`). Callers (Eleventy filters, content validation, `*.11tydata.js`) adapt to it; they do not redefine the map.
_Avoid_: Hardcoded `/pt/trabalho/` literals scattered in templates and validators
