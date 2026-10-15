---
"e2e": patch
---

`expect(locator).toHaveRole(role)` waits until the node's role equals `role`. The comparison is the role string the engine stored, exact and case-sensitive, with no ARIA hierarchy. A node stored with no role reads as `""`. `.not` and `{ timeout }` work like the other locator matchers.
