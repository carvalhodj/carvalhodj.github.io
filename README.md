# retro-theme

A minimalist Jekyll theme for an engineer's portfolio and blog. Modern
typography and generous whitespace first. The retro shows up only in the
details: an IBM BIOS bitmap font for labels, a blinking block cursor, `$`
prompts, bracketed links, terminal-style code windows, and (in dark mode) soft
neon and faint CRT scanlines.

- **Dark mode**: midnight blue with hot pink and electric cyan (Vice City sunset).
- **Light mode**: bone white with browns and warm grays. No glow.
- Follows the OS color scheme by default. The header toggle overrides it, and
  toggling back to the OS choice returns to "follow system".
- **Typeface toggle**: cycles IBM Plex Sans → Helvetica → Inter → DM Sans →
  Miranda Sans, so you can pick one. Code is always Fira Code (with ligatures).

## Running locally

```sh
bundle install
bundle exec jekyll serve --livereload
```

Then open http://127.0.0.1:4000.

## Structure

```
_layouts/   default, home, page, post, project, blog, projects
_includes/  header, footer, head, list partials, experience timeline
_sass/retro/
  _tokens.scss      all colors and fonts (edit the palette here)
  _base.scss        reset, typography, @font-face
  _layout.scss      header, main, footer
  _components.scss  hero, lists, toggles, page headers, 404 screen
  _prose.scss       Markdown content
  _code.scss        code blocks + Rouge syntax colors
  _effects.scss     scanlines, reduced motion, print
assets/js/retro.js  theme/font toggles, code block bars + copy button
assets/fonts/       IBM BIOS webfont (CC BY-SA 4.0)
_data/              navigation.yml, experience.yml
_projects/          portfolio entries (a collection)
_posts/             blog posts
```

## Configuration

In `_config.yml`:

```yaml
retro:
  prompt:                    # header brand: <user>@<host>:~# <cursor>
    user: alex
    host: local
    font: fira               # fira | bios (IBM BIOS bitmap)
    font_toggle: true        # show the prompt font switcher
  default_font: plex         # plex | helvetica | inter | dm-sans | miranda
  font_toggle: true          # set false once you've decided on a typeface
  scanlines: true            # faint CRT lines in dark mode
  search: true               # site search (⌘K / Ctrl+K / "/")
  back_to_top: true          # floating button to scroll back up
  auto_language: true        # send visitors to their region's language
  cursor: column             # column (█) | bar (|) | underscore (_)
social:
  - { name: github, url: https://github.com/you }
```

### Content

| What            | Where                    | Notes                                              |
| --------------- | ------------------------ | -------------------------------------------------- |
| Home intro      | `index.md`               | `layout: home`, optional `role`, `posts_limit`     |
| Projects        | `_projects/*.md`         | `title`, `summary`, `year`, `role`, `stack`, `links`, `featured` |
| Posts           | `_posts/*.md`            | `title`, `description`, `tags`                     |
| Work history    | `_data/experience.yml`   | rendered with `{% include experience.html %}`      |
| Navigation      | `_data/navigation.yml`   |                                                    |

Projects with `featured: true` appear on the home page.

Post tags are collected on `/tags/` (`tags.md`, `layout: tags`). Selecting a
tag, or following a tag link from a post, filters the page to that tag's posts.
The URL looks like `/tags/#reliability`, so filtered views can be shared.

### Contact

`/contact/` (`contact.md`, `layout: contact`) has a contact form and lists
every entry in `social` (with its `handle`). The form is sent by
[Web3Forms](https://web3forms.com) (free plan) and protected by hCaptcha, a
hidden honeypot field and required-field checks.

1. Create an access key at web3forms.com (it is public and safe to commit).
2. Set it in `_config.yml`:
   ```yaml
   contact:
     access_key: "your-key"
     subject: New message from the website
   ```
3. In the Web3Forms dashboard, enable hCaptcha for that form.

Until the key is set, the page shows a "not configured" notice. hCaptcha shows
a "localhost detected" warning during local development; it goes away on
your real domain.

### Search

The search button (or <kbd>⌘K</kbd> on macOS, <kbd>Ctrl</kbd>+<kbd>K</kbd> on
Windows/Linux, or <kbd>/</kbd> anywhere) opens a search over all posts,
projects and pages. `search.json` is generated at build time and fetched the
first time search opens; matching ignores case and accents. Add
`search: false` to a page's front matter to leave it out of the index.

### Languages

The site ships in English (at `/`) and Brazilian Portuguese (at `/pt/`). The
header shows the flag of the other language and links to the same page in
it, or to that language's home when the page has no translation.

```yaml
lang: en                 # default language, no URL prefix
languages:
  - { code: en,    label: EN, flag: uk }
  - { code: pt-BR, label: PT, flag: br, path: /pt }
```

| What                 | English                  | Portuguese                     |
| -------------------- | ------------------------ | ------------------------------ |
| Pages                | `about.md` → `/about/`   | `pt/about.md` → `/pt/about/`   |
| Posts                | `_posts/`                | `_posts/pt/`                   |
| Projects             | `_projects/`             | `_projects/pt/`                |
| Experience/education | `_data/experience.yml`   | `_data/pt-BR/experience.yml`   |
| Interface strings    | `_data/i18n.yml` → `en`  | `_data/i18n.yml` → `pt-BR`     |

Files under those Portuguese folders get `lang: pt-BR` automatically
(`defaults` in `_config.yml`). A translation is found when it has the same URL
under `/pt` (same filename), or when both versions share a `ref:` in front
matter (useful when the post titles, and so the URLs, differ). Lists, tags,
older/newer links and search only show content in the language being read.

To drop a language, remove its entry from `languages`; with one entry the
switcher is hidden.

**Automatic language.** Visitors are sent to the version for their region:
Brazil gets Portuguese, everyone else English. A static site can't see the
visitor's IP, so the browser guesses the country from its time zone (any
Brazilian zone), then from the browser language's region (`pt-BR`). Once a
visitor picks a language with the flag, that choice is remembered and wins.
Search engine crawlers are never redirected, and pages without a translation
stay put. Map more countries with `regions: [BR, ...]` on a language, or turn
it off with `retro.auto_language: false`.

**404 page.** The host serves the root `404.html` for every missing address,
so it switches to `pt/404.html` when the address starts with `/pt/`, or when
the visitor's language is Portuguese. The missing address stays in the
address bar. Both use the text from `not_found_*` in `_data/i18n.yml`.

### Favicon

Put your icons in `assets/favicon/`. The head links each of these only when
the file exists, so add whichever you have:

| File                   | Used for                              |
| ---------------------- | ------------------------------------- |
| `favicon.ico`          | Older browsers, 32×32                 |
| `favicon.svg`          | Modern browsers, sharp at any size    |
| `favicon.png`          | PNG fallback if you have no SVG       |
| `apple-touch-icon.png` | iOS home screen, 180×180              |
| `site.webmanifest`     | Android / install icons               |

## Using it as a gem theme

The `retro-theme.gemspec` packages `_layouts`, `_includes`, `_sass` and
`assets`. In another site, add `gem "retro-theme"` (or a `path:`/`git:`
source) to the Gemfile and set `theme: retro-theme` in `_config.yml`.

## Credits

- [IBM BIOS](https://int10h.org/oldschool-pc-fonts/fontlist/?1#ibm-bios) font by VileR, The Oldschool PC Font Resource, CC BY-SA 4.0
- [IBM Plex Sans](https://github.com/IBM/plex), [Inter](https://rsms.me/inter/), [DM Sans](https://fonts.google.com/specimen/DM+Sans), [Miranda Sans](https://fonts.google.com/specimen/Miranda+Sans) and [Fira Code](https://github.com/tonsky/FiraCode), via Google Fonts, SIL OFL
