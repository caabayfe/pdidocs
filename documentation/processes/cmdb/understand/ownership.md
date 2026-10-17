---
title: Who owns what
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_dictionary/a6023a7b8c9103100a22deb6dd2b4e33
    how: read cmdb_ci.support_group
    result: Support group
    hash: 8b955b25b82919d339234d4bced5973f057c5757c25479458bcfa532b5e002c1
  E02:
    record: sys_dictionary/a602f67b8c9103100a22deb6dd2b4efb
    how: read cmdb_ci.assignment_group
    result: Change Group
    hash: 3953c195246304636cdf8c2b9d075756a14446b6210f0d70cae2c2ef512350c7
  E03:
    record: sys_dictionary/ae023a7b8c9103100a22deb6dd2b4e28
    how: read cmdb_ci.owned_by
    result: Owned by
    hash: 0471c0d240e1587434aef8b3690b5a9e8de0d5c1f85e3cfc5bc3d7564ad32d56
  E04:
    record: sys_script/27453ac6b73610102d2fbc16de11a937
    field: script
    how: read Populate Assignment Group based on CI/SO
    result: an empty assignment group is filled from the CI's support group (incident, problem) or change group (change)
    hash: 0e3a958914d0876724533ef5bbe26decbf83e5305e020f9e5a2edcf725aa487c
  E05:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Configuration Items list'
    how: 'filtered on the groups'
    result: '37 CIs have a Support group (web servers, services); none has a Change Group; no server has a Support group'
---
## The fields that route work

| Field | Who | Used for |
|---|---|---|
| **Support group** | the team that fixes it | incidents and problems go to it [E01] [E04] |
| **Change Group** | the team that changes it | changes go to it [E02] [E04] |
| **Owned by** | the person accountable for it | certification and attestation [E03] |

### For you {for=user}

Nothing to do: these decide which team gets your incident.

### On pdi2 {for=operator}

Only 37 CIs have a **Support group**, mostly web servers and services; **no server** has one, and
**no CI** has a **Change Group**. [E05] So routing by CI rarely works: set the assignment group
yourself, and ask CI owners to fill these fields.
