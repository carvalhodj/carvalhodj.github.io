---
title: tinyqueue
summary: A durable job queue in a single SQLite file. Open source.
year: 2023
role: Author
stack: [Rust, SQLite]
featured: true
links:
  - name: source
    url: https://github.com/
---

A side project that grew. tinyqueue gives small services retries, scheduling
and dead-letter handling without running a broker.

```rust
let queue = Queue::open("jobs.db")?;
queue.push("emails", &Welcome { user_id: 42 })?;
```
