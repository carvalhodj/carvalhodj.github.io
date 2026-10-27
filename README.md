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

## Using it as a gem theme

The `retro-theme.gemspec` packages `_layouts`, `_includes`, `_sass` and
`assets`. In another site, add `gem "retro-theme"` (or a `path:`/`git:`
source) to the Gemfile and set `theme: retro-theme` in `_config.yml`.

## Credits

- [IBM BIOS](https://int10h.org/oldschool-pc-fonts/fontlist/?1#ibm-bios) font by VileR, The Oldschool PC Font Resource, CC BY-SA 4.0
- [IBM Plex Sans](https://github.com/IBM/plex), [Inter](https://rsms.me/inter/), [DM Sans](https://fonts.google.com/specimen/DM+Sans), [Miranda Sans](https://fonts.google.com/specimen/Miranda+Sans) and [Fira Code](https://github.com/tonsky/FiraCode), via Google Fonts, SIL OFL
