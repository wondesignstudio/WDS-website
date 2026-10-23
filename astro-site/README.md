# WDS Astro CMS workspace

This branch prepares the Astro site and Pages CMS without changing the production branch or domain.

- CMS: https://app.pagescms.org/wondesignstudio/wds-website/codex%2Fastro-cms-setup/collection/insights
- Review site: https://wds-studio-preview.pages.dev
- Run from `astro-site`: `npm ci`, `npm run dev`.
- Validate: `npm run verify` (content filtering, form regression tests and build).
- Local form configuration: copy `.env.example` to `.env` and set `PUBLIC_WEB3FORMS_ACCESS_KEY` to the public form key from Web3Forms. Never put private API tokens in source files.
- Work, Insights and Services use `published`; unpublished entries are excluded from all public outputs.
- Homepage selection is managed separately in site settings. Leave homepage settings unchanged during CMS acceptance.
- Insight covers must not contain text. Existing typographic covers are temporary and not approved for production.
- This branch has Vercel automatic deployment disabled. No production merge, domain cutover or live publication has been performed.
- Pages CMS saves to `codex/astro-cms-setup`; Cloudflare Pages automatically builds and updates the review site after each saved commit. Wait for a successful deployment before checking the change.
- Pages build settings: root `astro-site`, command `npm run verify`, output `dist`, Node.js `22`. The new project's primary branch is the CMS branch; other branches are excluded. This does not change the repository's production `main` or the existing domain.
- The Web3Forms public form key is configured in the Pages project environment. The review project has no custom domains; `pages.dev` review URLs send `X-Robots-Tag: noindex, nofollow`.
- Acceptance: CMS test article published and observed on the review site (`330b9b3`), then restored to unpublished and confirmed 404 (`546f41c`). The homepage stayed byte-identical across both deployments. The test draft remains unpublished.
