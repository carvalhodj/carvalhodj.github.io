# retro-theme

A minimalist Hugo theme for an engineer's portfolio and blog. Modern
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

Ported from the Jekyll version of the same theme.

## Requirements

- Hugo **0.158 or newer** (the extended edition isn't needed)
- [Dart Sass](https://gohugo.io/functions/css/sass/#dart-sass) on your `PATH`
  (`brew install sass/sass/sass`, or `sudo snap install dart-sass`)

## Running locally

The site in `exampleSite/` uses the theme from this folder:

```sh
cd exampleSite
hugo server
```

Then open http://localhost:1313.

## Structure

```
layouts/
  baseof.html, home.html, page.html, section.html, contact.html
  taxonomy.html (the tags page), term.html, 404.html
  blog/       post list (grouped by year) and post page
  projects/   project list and project page
  _partials/  header, footer, head, seo, list partials, language helpers
  _shortcodes/ experience, education
  _markup/    code block render hook (every block gets the terminal window)
  home.searchindex.json   search.json
  home.rss.xml            feed.xml (blog posts only)
assets/css/retro/
  _tokens.scss      all colors and fonts (edit the palette here)
  _base.scss        reset, typography, @font-face
  _layout.scss      header, main, footer
  _components.scss  hero, lists, toggles, page headers, 404 screen
  _prose.scss       Markdown content
  _code.scss        code blocks + Chroma syntax colors
  _effects.scss     scanlines, reduced motion, print
assets/js/retro.js  theme/font toggles, code block bars + copy button
static/fonts/       IBM BIOS webfont (CC BY-SA 4.0)
i18n/               interface strings, one file per language
archetypes/         front matter for `hugo new content blog/…` and `projects/…`
exampleSite/        a complete bilingual site using the theme
```

To change a single file of the theme (say, the palette), copy it to the
same path in your site (`assets/css/retro/_tokens.scss`) and edit it there.

## Using the theme in your site

As a Hugo module, a git submodule in `themes/`, or a copy in `themes/`. With
a copy or submodule:

```toml
theme = "retro-theme"
```

Hugo doesn't take outputs, permalinks or highlighting settings from a theme,
so copy this block from `exampleSite/hugo.toml` into your `hugo.toml`:

```toml
[outputs]
  home = ["html", "rss", "searchindex"]   # searchindex = search.json
  section = ["html"]
  taxonomy = ["html"]
  term = ["html"]

[taxonomies]
  tag = "tags"

[permalinks.page]
  blog = "/blog/:year/:slugorcontentbasename/"
  projects = "/projects/:slugorcontentbasename/"

[frontmatter]
  date = [":filename", ":default"]          # 2026-01-31-my-post.md

[markup.highlight]
  noClasses = false                         # colors come from _code.scss
```

Also set `capitalizeListTitles = false` to show tags as you wrote them.

## Configuration

In `hugo.toml`:

```toml
[params]
  description = "Shown in search results and the feed."
  [params.author]
    name = "Alex"
  [[params.social]]
    name = "github"
    handle = "@you"                        # shown on the contact page
    url = "https://github.com/you"

  [params.retro]
    default_font = "plex"        # plex | helvetica | inter | dm-sans | miranda
    font_toggle = true           # set false once you've decided on a typeface
    scanlines = true             # faint CRT lines in dark mode
    search = true                # site search (⌘K / Ctrl+K / "/")
    back_to_top = true           # floating button to scroll back up
    auto_language = true         # send visitors to their region's language
    cursor = "column"            # column (█) | bar (|) | underscore (_)
    [params.retro.prompt]        # header brand: <user>@<host>:~$ <cursor>
      user = "alex"
      host = "local"
      font = "fira"              # fira | bios (IBM BIOS bitmap)
      font_toggle = true         # show the prompt font switcher
```

### Content

| What            | Where                          | Notes                                              |
| --------------- | ------------------------------ | -------------------------------------------------- |
| Home intro      | `content/_index.md`            | optional `role`, `headline`, `posts_limit`         |
| Projects        | `content/projects/*.md`        | `title`, `summary`, `year`, `role`, `stack`, `links`, `featured` |
| Posts           | `content/blog/*.md`            | `title`, `description`, `tags`                     |
| Work history    | `data/experience.yml`          | rendered with `{{< experience >}}`             |
| Education       | `data/education.yml`           | rendered with `{{< education >}}`              |
| Navigation      | `data/navigation.yml`          | `title` is looked up as `nav_<title>` in `i18n/`   |
| Contact page    | `content/contact.md`           | `layout: contact`                                  |

The list pages take their title and description from `_index.md` in
`content/blog/`, `content/projects/` and `content/tags/`.

Name posts `2026-01-31-my-post.md`: the date and the URL
(`/blog/2026/my-post/`) come from the file name, as in Jekyll. Create one
with `hugo new content blog/2026-01-31-my-post.md`.

Projects with `featured: true` appear on the home page.

Post tags are collected on `/tags/`. Selecting a tag, or following a tag link
from a post, filters the page to that tag's posts. The URL looks like
`/tags/#reliability`, so filtered views can be shared. Each tag also has its
own page at `/tags/reliability/`.

### Code blocks

Fenced code blocks are highlighted by Hugo (Chroma) and get a title bar with
the language and a copy button. A block without a language is labelled
`text`. Line numbers and highlighted lines work as usual in Hugo:

````md
```go {linenos=table,hl_lines=[3]}
...
```
````

### Contact

`/contact/` (`contact.md` with `layout: contact`) has a contact form and
lists every entry in `params.social` (with its `handle`). The form is sent by
[Web3Forms](https://web3forms.com) (free plan) and protected by hCaptcha, a
hidden honeypot field and required-field checks.

1. Create an access key at web3forms.com (it is public and safe to commit).
2. Set it in `hugo.toml`:
   ```toml
   [params.contact]
     access_key = "your-key"
     subject = "New message from the website"
   ```
3. In the Web3Forms dashboard, enable hCaptcha for that form.

Until the key is set, the page shows a "not configured" notice. hCaptcha shows
a "localhost detected" warning during local development; it goes away on
your real domain.

### Search

The search button (or <kbd>⌘K</kbd> on macOS, <kbd>Ctrl</kbd>+<kbd>K</kbd> on
Windows/Linux, or <kbd>/</kbd> anywhere) opens a search over all posts,
projects and pages. Each language gets its own `search.json`, written at build
time and fetched the first time search opens; matching ignores case and
accents. Add `search: false` to a page's front matter to leave it out of the
index.

### Languages

The example site ships in Brazilian Portuguese (the default, at `/`) and
English (at `/en/`). The header shows the flag of the other language and
links to the same page in it, or to that language's home when the page has no
translation.

```toml
defaultContentLanguage = "pt-br"

[languages.pt-br]
  locale = "pt-BR"
  label = "PT"                     # switcher label
  contentDir = "content/pt-br"
  weight = 1
  [languages.pt-br.params]
    flag = "br"
    regions = ["BR"]

[languages.en]
  locale = "en"
  label = "EN"
  contentDir = "content/en"
  weight = 2
  [languages.en.params]
    flag = "uk"
    fallback = true
```

| What                 | Portuguese (default)            | English                              |
| -------------------- | ------------------------------- | ------------------------------------ |
| Pages                | `content/pt-br/about.md` → `/about/` | `content/en/about.md` → `/en/about/` |
| Posts                | `content/pt-br/blog/`           | `content/en/blog/`                   |
| Projects             | `content/pt-br/projects/`       | `content/en/projects/`               |
| Experience/education | `data/experience.yml`           | `data/en/experience.yml`             |
| Interface strings    | `i18n/pt-br.yaml`               | `i18n/en.yaml`                       |

A translation is found when it has the same path in the other language's
content folder (same filename), or when both versions share a
`translationKey` in front matter (useful when the file names, and so the
URLs, differ). Lists, tags, older/newer links and search only show content in
the language being read.

To add a language, add it to `languages` and add an `i18n/<lang>.yaml` (copy
`en.yaml`). The `read_in_<lang>` lines label the switcher and are the same in
every i18n file. The flags drawn are `br` and `uk`; any other `flag` value
is shown as text. To drop a language, remove it from `languages`; with one
language the switcher is hidden.

**Automatic language.** Visitors are sent to the version for their region:
Brazil gets Portuguese, everyone else English. A static site can't see the
visitor's IP, so the browser guesses the country from its time zone (any
Brazilian zone), then from the browser language's region (`pt-BR`). A
language's `regions` lists the countries that get it; everyone else gets the
language marked `fallback = true`. Once a visitor picks a language with the
flag, that choice is remembered and wins. Search engine crawlers are never
redirected, and pages without a translation stay put. Turn it off with
`params.retro.auto_language = false`.

**404 page.** Hugo writes a 404 page per language (`/404.html` and
`/en/404.html`). The host serves the root one for every missing address, so
it switches to the English one when the address starts with `/en/`, or when
the visitor's language is English. The missing address stays in the address
bar. Both use the `not_found_*` strings in `i18n/`.

### Favicon

Put your icons in your site's `assets/favicon/`. The head links each of these
only when the file exists, so add whichever you have:

| File                   | Used for                              |
| ---------------------- | ------------------------------------- |
| `favicon.ico`          | Older browsers, 32×32                 |
| `favicon.svg`          | Modern browsers, sharp at any size    |
| `favicon.png`          | PNG fallback if you have no SVG       |
| `apple-touch-icon.png` | iOS home screen, 180×180              |
| `site.webmanifest`     | Android / install icons               |

## Deploying

`.github/workflows/hugo.yml` builds `exampleSite/` with Hugo and Dart Sass and
deploys it to GitHub Pages on every push to `main`. In the repository
settings, set Pages → Source to "GitHub Actions".

## Credits

- [IBM BIOS](https://int10h.org/oldschool-pc-fonts/fontlist/?1#ibm-bios) font by VileR, The Oldschool PC Font Resource, CC BY-SA 4.0
- [IBM Plex Sans](https://github.com/IBM/plex), [Inter](https://rsms.me/inter/), [DM Sans](https://fonts.google.com/specimen/DM+Sans), [Miranda Sans](https://fonts.google.com/specimen/Miranda+Sans) and [Fira Code](https://github.com/tonsky/FiraCode), via Google Fonts, SIL OFL
