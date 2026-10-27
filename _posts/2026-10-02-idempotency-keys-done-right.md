---
title: Idempotency keys, done right
description: Retries are inevitable. Charging a customer twice is not.
tags: [distributed-systems, apis]
---

Every network call can fail in three ways: it succeeds, it fails, or you have
no idea. The third case is the interesting one, and idempotency keys are how
an API lets clients retry safely when they don't know what happened.

## The contract

The client generates a unique key per *logical* operation and sends it with
every attempt. The server promises that all requests carrying the same key
produce the same effect, and the same response, as the first one.

```http
POST /v1/payments HTTP/1.1
Idempotency-Key: 7f3c9a2e-4b1d-4e8a-9c3f-2d6b8e1a0f55
Content-Type: application/json

{ "amount": 4200, "currency": "EUR" }
```

## Storing the result, not just the key

A common mistake is to store only *that* a key was seen. When the retry
arrives, the server has nothing useful to return. Store the response instead:

```go
type Record struct {
	Key        string
	RequestSum [32]byte // hash of the body, to reject key reuse
	Status     int
	Body       []byte
	CreatedAt  time.Time
}

func (s *Server) Handle(ctx context.Context, key string, req []byte) (*Record, error) {
	sum := sha256.Sum256(req)

	rec, err := s.store.Claim(ctx, key, sum) // INSERT ... ON CONFLICT DO NOTHING
	if errors.Is(err, ErrInFlight) {
		return nil, ErrRetryLater // 409: another attempt is still running
	}
	if rec != nil {
		if rec.RequestSum != sum {
			return nil, ErrKeyReused // 422: same key, different request
		}
		return rec, nil // replay the stored response
	}

	return s.execute(ctx, key, req)
}
```

Three outcomes, three status codes. Clients can reason about each one.

## What about expiry?

Keys don't need to live forever, only longer than your clients' retry window.
We keep them for 24 hours and say so in the docs.

| Concern          | Decision                         |
| ---------------- | -------------------------------- |
| Key scope        | Per API account                  |
| Retention        | 24 hours                         |
| Body mismatch    | `422 Unprocessable Entity`       |
| Concurrent retry | `409 Conflict` + `Retry-After`   |

> Make the safe thing the easy thing. If clients have to think hard about
> retries, some of them will get it wrong.

The full design doc is internal, but I'm happy to talk through it. Hit
<kbd>Ctrl</kbd> + <kbd>F</kbd> for "ledger" on the [about page](/about/) for
context on where this came from.
