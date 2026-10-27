---
title: Ledger platform
summary: Event-sourced double-entry ledger handling 40M transactions a day.
year: 2025
role: Tech lead
stack: [Go, Kafka, Postgres]
featured: true
links:
  - name: talk
    url: https://example.com
---

Settlement used to run as a nightly batch. When it failed, finance found out
in the morning. We replaced it with an event-sourced ledger where every
balance is a projection of an append-only journal.

## Outcomes

- Balances are available in under two seconds instead of the next day
- Reconciliation went from a two-person job to an automated report
- Zero balance discrepancies since launch
