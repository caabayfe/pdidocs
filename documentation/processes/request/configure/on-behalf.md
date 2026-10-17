---
title: Ordering for others - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_properties/dd2d5db3c0a8017c01e07f4b39205093
    how: read glide.sc.req_for.roles
    result: shown as redacted in the mirror; empty on screen; last changed 2025-08-20
    hash: 677954c4989b9758d7536fbaf3c2e00f3a115ad12ea9fb879e122619f8ef955f
  E02:
    record: sys_properties/d27e754053302010bddaddeeff7b120e
    field: value
    how: read glide.sc.req_for.roles.default
    result: deny
    hash: 3026a0ca485e5831657ba0120fa8dd66b3425427bfb0a2be0db743e2305cc7c5
  E03:
    record: sys_declarative_action_assignment/650cc0dc77620210c9ee78dabd5a99b7
    field: client_script
    how: read Create request (incident)
    result: opens the catalog from the incident
    hash: c86bf554da2e1e0d899ceba5148b7ff4bf6c894486ea11e53b2ab8c63cb3ae5e
---
## Requested for {label=OPEN-QUESTION}

With no roles listed and the default *deny* [E01] [E02], nobody can change *Requested for* at
checkout. The roles property was changed on 2025-08-20: was emptying it intended? *Create
request* opens the catalog from the incident [E03]; check how it sets the person the request is
for.
