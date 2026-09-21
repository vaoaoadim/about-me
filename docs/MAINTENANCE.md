# Profile maintenance

- `README.md` is the profile entry point; `README.ru.md` is its Russian equivalent. Update both together.
- `scripts/buttons.mjs` generates self-contained SVG link buttons from the portfolio palette.
- `scripts/activity.mjs` reads only the signed-out public GitHub contribution calendar. No personal token or private repository access is used. If GitHub changes its HTML format, generation fails instead of replacing a valid graphic with invented data.
- `.github/workflows/activity.yml` runs daily and on demand. Its repository token can write only within this repository. It publishes two SVGs to `activity`, as `github-actions[bot]`, not to the default branch and not under Vadim's identity. Third-party actions are pinned by SHA.
- The animated frame is decoration; contribution cells keep their real public activity levels. CSS reduced-motion disables the animation. GitHub's native contribution graph is untouched.
- GitHub may cache images and delay scheduled workflows. The graphic includes its data date. Inactive public repositories may have scheduled workflows disabled by GitHub; re-enable the workflow if needed.
- No third-party stats service, tracking pixel, visitor counter or invented ratings are embedded.
- Website link is deliberately omitted: the owner confirmed Sites is a work-in-progress, not yet launched. Add its public URL after launch. Instagram and Threads also await confirmed URLs.

## Verification

```sh
node scripts/buttons.mjs
node --test scripts/activity.test.mjs
node scripts/activity.mjs
```

To refresh after publication: run **Refresh public contribution artwork** in Actions.

## Rollback

Revert the profile commit to undo a content change. Disable the contribution workflow to stop scheduled updates. Replacing the README image with a checked-in last-known-good SVG is a static fallback. No website deployment is involved.
