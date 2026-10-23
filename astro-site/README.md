# WDS Astro CMS workspace

This branch prepares the Astro site and Pages CMS without changing the production branch or domain.

- CMS: https://app.pagescms.org/wondesignstudio/wds-website/codex%2Fastro-cms-setup
- Run from `astro-site`: `npm ci`, `npm run dev`.
- Validate: `npm run verify` (content filtering, form regression tests and build).
- Local form configuration: copy `.env.example` to `.env` and set `PUBLIC_WEB3FORMS_ACCESS_KEY` to the public form key from Web3Forms. Never put private API tokens in source files.
- Work, Insights and Services use `published`; unpublished entries are excluded from all public outputs.
- Homepage selection is managed separately in site settings. Leave homepage settings unchanged during CMS acceptance.
- Insight covers must not contain text. Existing typographic covers are temporary and not approved for production.
- This branch has Vercel automatic deployment disabled. No production merge, domain cutover or live publication has been performed.
- Pages CMS edits GitHub files only. Cloudflare auto-deployment is a separate pending integration.
