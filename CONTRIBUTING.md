# Contributing to WDS Website

Thank you for contributing to WDS Website. Keep changes focused, easy to review, and safe to deploy.

## Branches

Create a short-lived branch from the latest `main` branch. Use a descriptive name such as:

- `feature/project-gallery`
- `fix/mobile-navigation`
- `docs/update-readme`
- `chore/refresh-dependencies`

Do not commit directly to `main`.

## Before opening a pull request

1. Review the complete diff and remove unrelated changes.
2. Run the repository's available test, lint, and build checks.
3. Test visible changes in a browser at desktop, tablet, and mobile widths.
4. Check keyboard navigation, labels, focus states, and color contrast for UI changes.
5. Make sure no secrets, credentials, private data, or generated build output are included.
6. Update documentation and tests when behavior changes.

## Pull requests

- Use a concise title that describes the outcome of the change.
- Explain what changed, why it changed, and how it was validated.
- Link related issues with `Closes #123` when the PR should close an issue.
- Include before-and-after screenshots or a recording for visible UI changes.
- Keep the PR focused. Split unrelated work into separate pull requests.
- Open a draft PR when the work is not ready for final review.
- Resolve review conversations or explain why no change is needed before merging.

## Review and merge

At least one reviewer should confirm that the change is understandable, tested in proportion to its risk, and ready to deploy. Merge only after required checks pass and review feedback is resolved.
