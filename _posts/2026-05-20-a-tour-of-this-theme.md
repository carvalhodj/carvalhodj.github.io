---
title: A tour of this theme
description: Every Markdown element this theme styles, in one place.
tags: [meta]
---

This post doubles as a style guide. If something looks off here, it will look
off everywhere.

## Text

Body copy is set in a modern sans: IBM Plex Sans, Helvetica, Inter, DM Sans or
Miranda Sans, switchable from the header. **Bold**, *italic*, ~~strikethrough~~ and `inline code` all work,
as do [links](https://jekyllrb.com) and keyboard keys like <kbd>Esc</kbd>.

### Lists

- Unordered lists use a small triangle marker
- Nested content stays readable
  - like this
- And keeps a comfortable rhythm

1. Ordered lists use monospaced numbers
2. Which line up nicely
3. Even past nine

### Quotes

> Simplicity is prerequisite for reliability.
>
> — Edsger W. Dijkstra

## Code

Code uses Fira Code, with ligatures: `=>`, `!==`, `<=`, `->`.

```typescript
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

export async function fetchJson<T>(url: string): Promise<Result<T>> {
  try {
    const res = await fetch(url);
    if (res.status !== 200) return { ok: false, error: new Error(res.statusText) };
    return { ok: true, value: (await res.json()) as T };
  } catch (error) {
    return { ok: false, error: error as Error };
  }
}
```

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Point:
    x: float
    y: float

    def distance(self, other: "Point") -> float:
        return ((self.x - other.x) ** 2 + (self.y - other.y) ** 2) ** 0.5
```

```console
$ bundle exec jekyll serve --livereload
      Server address: http://127.0.0.1:4000/
```

```diff
- const retries = 0;
+ const retries = 3;
```

## Tables

| Mode  | Background | Accents            | Neon |
| ----- | ---------- | ------------------ | ---- |
| Dark  | Midnight   | Hot pink, cyan     | Yes  |
| Light | Bone white | Brown, warm gray   | No   |

## Footnotes

The bitmap font in labels is IBM's original BIOS typeface.[^font]

[^font]: Converted by VileR for [The Oldschool PC Font Resource](https://int10h.org/oldschool-pc-fonts/), CC BY-SA 4.0.
