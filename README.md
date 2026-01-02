# GitLinks

A simple, privacy-friendly "linktree" you can fork and customize. Ideal for streamers and creators who want a fast static page they control — edit a single file (user.json), save, and your page updates.

![Presenting linktree](https://github.com/tinyplayerss/linktree/assets/123846642/9a54a16c-747a-47a5-b37a-133e197c4699)

<a target="_BLANK" href="https://paypal.me/2players1gamer"><img src="https://github.com/tinyplayerss/linktree/assets/123846642/4d60218d-4a4b-4b97-a46f-f767e444ce23" align="center" width="360" height="120"></a>

---

## Quick start (3 easy steps)
1. Click "Use this template" or "Fork" to create your own copy of this repository.  
2. Open the file `user.json` in your repo, edit the Link Names, URLs, or Divider Titles, then click **Commit changes**.  
3. Wait ~30–90 seconds for GitHub Pages to publish your site, then open:
   `https://YOUR_GITHUB_USERNAME.github.io/gitlinks`

That’s it — keep everything else the same; only change the parts described below.

---

## Why choose GitLinks? (quick comparison)

| Feature / Benefit                          | GitLinks (this project) | Linktree & Hosted Services |
|--------------------------------------------|:-----------------------:|:--------------------------:|
| Open-source (full repo access)             | ✔️                      | ❌                         |
| Privacy-first (no tracking by default)     | ✔️                      | ❌                         |
| Self-hostable / free static hosting        | ✔️                      | ❌                         |
| Versioned via Git (forks, PRs, history)    | ✔️                      | ❌                         |
| High-quality favicons & crisp assets       | ✔️                      | ✔️                         |
| Divider categories with centered titles    | ✔️                      | ✔️                         |
| Unlimited links (no hidden limits)         | ✔️                      | ❌ (limits on free tiers)  |
| Custom domain support (no mandatory paywall)| ✔️ (via GitHub Pages)  | ❌ (often paid)            |
| No forced branding / remove brand easily   | ✔️                      | ❌ (paid on many services) |
| Theme customization (CSS / HTML control)   | ✔️                      | ❌ (limited unless paid)   |
| Export / backup via Git (full control)     | ✔️                      | ❌                         |
| Built-in visual editor & analytics         | ❌ (optional add-ons)    | ✔️ (usually paid)          |
| One-click deploy via GitHub template       | ✔️                      | ❌                         |
| Ideal for non-technical users out-of-box   | ❌ (but simple workflow) | ✔️                         |

Short take:
- Pros (GitLinks): total control, privacy, free self-hosting, unlimited links, and Git-based workflow for safe edits and collaboration. Great for people who want freedom from paywalls and vendor lock-in.
- Cons (GitLinks): currently favors a simple file-based workflow rather than a full visual editor or built-in analytics — those can be added or used as optional hosted services.

---

## No paywalls — what that actually means
Many hosted link services place basic features behind paid tiers (for example: limiting free users to 5 links, forcing branding, or charging extra for custom domains and removal of the platform logo). GitLinks takes a different approach:

- Unlimited links: add as many link buttons as you want — there is no enforced cap in the project itself.
- No mandatory paywall for basics: the project is open-source and self-hosted, so you don’t need to pay to use core features (links, dividers, custom CSS, favicon improvements).
- Custom domains: GitHub Pages supports custom domains for free, so you can use your own domain without paying Linktree-style fees.
- Full control: you can remove or replace branding, change styling, and version-control everything in Git.
- Optional paid services: if you want analytics, a hosted visual editor, or managed backups, those can be offered separately — but they are opt-in, not required.

Why this works: because the code and content live in your repository, the project acts as a tool you control rather than a locked service. If you want hosted convenience, you can build it on top — but the core functionality remains free.

---

## How to edit (non-technical)
- Each item in `user.json` becomes a button or a divider on your page.
- To add a normal link, add an object like:
```json
{ "name": "My Link", "url": "https://example.com" }
```
- To add a divider (category label), add an object like:
```json
{ "name": "spacer", "type": "spacer", "title": "Category 1", "color": "#ffffff" }
```
- Place divider objects between links where you want grouped sections to appear.
- Only change the `name`, `url`, or `title` and `color` fields — do not remove other parts of the file unless you know what you're doing.

Sample `user.json` (ready to copy/paste):
```json
{
  "githubUsername": "YOUR_GITHUB_NAME",
  "links": [
    { "name": "XYZ", "url": "https://example.com" },
    { "name": "spacer", "type": "spacer", "title": "Category 1", "color": "#ffffff" },
    { "name": "XYZ", "url": "https://example.com" },
    { "name": "XYZ", "url": "https://example.com" }
  ]
}
```

---

## Expected behavior & timing
- After you commit changes, GitHub Pages will publish the site. Changes usually appear in 30–90 seconds.
- If you don't see updates, try a hard refresh in your browser (Ctrl+F5 or Cmd+Shift+R).
- The script auto-fetches a fresh copy of `user.json` on each load, so updates show up quickly.

Tip for instant refresh during testing
- We include a cache-busting query when fetching `user.json` (e.g. `user.json?t=123456789`) so most browsers load the newest version automatically. If edits still don’t appear, verify your commit on GitHub and then hard-refresh the page.

---

## Divider (spacer) details
- Use `"type": "spacer"` to mark an object as a divider.
- The optional `"title"` shows a label centered in the divider (e.g., "Category 1").
- The optional `"color"` sets the divider and title color (use hex like `#ffffff`). Defaults to white if omitted.

Example divider:
```json
{ "name": "spacer", "type": "spacer", "title": "Socials", "color": "#00aced" }
```

---

## Accessibility & safety
- Buttons and dividers are keyboard accessible.
- Names and titles are escaped to prevent unsafe HTML.
- External links open in a new tab (`target="_blank"`) and use `rel="noopener noreferrer"` for safety.

---

## Troubleshooting (simple)
- Edits not showing: Wait up to 90 seconds, then hard refresh (Ctrl+F5 / Cmd+Shift+R).  
- Mistyped JSON: If the site stops loading, open `user.json` in GitHub and undo your last change. Use the sample above as a correct template.  
- Need help? Open an issue in this repo with a screenshot and your `user.json` content (don’t share secrets).

---

## Make it your own (recommended next steps)
- Change only `user.json` to manage links; keep everything else default for easiest maintenance.
- If you want a custom domain, add it in the repository Pages settings (Settings → Pages).
- Consider using the "Use this template" button so other people can create their own copy with one click.
- If you want a no-code UI later, we can add an optional visual editor that writes `user.json` to your repo (opt-in).

---

Thanks for using GitLinks — unlimited links, no paywalls, and full control.
