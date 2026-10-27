---
title: Lessons from fifteen years of on-call
description: Fewer alerts, better runbooks, and why the pager should be boring.
tags: [operations, leadership, reliability]
---

I took my first pager shift in 2010. It was a literal pager. Since then I've
been paged for full disks, expired certificates, leap seconds, a squirrel,
and, more than once, for an alert I had written myself the week before.

Here is what stuck.

## Every alert must be actionable

If the right response to a page is "wait and see", it should not page. Move
it to a dashboard or a ticket queue. A noisy pager trains people to ignore it,
and then the real incident gets the same shrug.

## Runbooks are code

They rot just as fast. Keep them next to the service, review them in pull
requests, and link them directly from the alert:

```yaml
- alert: LedgerConsumerLag
  expr: kafka_consumergroup_lag{group="ledger"} > 50000
  for: 10m
  labels:
    severity: page
  annotations:
    summary: "Ledger consumer is {% raw %}{{ $value }}{% endraw %} messages behind"
    runbook: https://runbooks.internal/ledger/consumer-lag
```

## Hand-offs matter more than heroics

1. Write down what you changed, even if it seemed obvious.
2. Say what you *didn't* get to.
3. Hand over open questions, not just open incidents.

---

None of this is new. The hard part is doing it every week, especially the
weeks when nothing breaks.
