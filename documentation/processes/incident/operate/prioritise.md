---
title: Set the priority
reviewed: 2026-10-17
evidence:
  E01:
    record: dl_definition/302849102b031000de0aba36a3fd5631
    how: read the Priority Lookup data lookup
    result: priority is set from impact and urgency on the form, on insert and on update
    hash: 9ce013173c49e78eb1f7963690a52ff2fc96c9a822f4ab3bf778ab32b7c91735
  E02:
    record: sys_ui_policy/3f004001a7102000dada192bd9acf4bf
    how: read Priority is managed by Data Lookup - set as read-only
    result: the priority field is read-only
    hash: 26f0741eb6f0490c97755976b12ab8af2605007e9d964fb4ec4de250bebfae92
---
## Two questions decide the priority

- **Impact**: how many people or how much of the business is affected?
  *1 - High* (a whole department, a critical service), *2 - Medium* (a team), *3 - Low* (one person).
- **Urgency**: how soon does it hurt? *1 - High* (work has stopped), *2 - Medium* (work is slowed,
  there's a workaround), *3 - Low* (it can wait).

You choose the two; the **priority** fills in by itself and can't be typed. [E01] [E02]

{{animation:incprio}}

| Impact ↓ Urgency → | 1 - High | 2 - Medium | 3 - Low |
|---|---|---|---|
| **1 - High** | 1 - Critical | 2 - High | 3 - Moderate |
| **2 - Medium** | 2 - High | 3 - Moderate | 4 - Low |
| **3 - Low** | 3 - Moderate | 4 - Low | 4 - Low |

## Why it matters

The priority sets the deadlines for the first response and for the fix (see *Deadlines at a
glance* on the process page). A priority 1 incident is watched around the clock.

## Changing the priority later

When the situation changes (more people affected, a workaround found), change the impact or the
urgency. You must write a **work note** saying why.

## Tips

- Don't raise the urgency to get faster service; it pushes other people's incidents back.
- The caller sets only the urgency on the portal. Check the impact when you pick up the incident.
