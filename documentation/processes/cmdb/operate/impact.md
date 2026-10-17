---
title: See what depends on a configuration item
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_declarative_action_assignment/d8b16452439e42102e5e1febb7b8f26d
    how: read CI dependency view (workspace)
    result: a field action on Configuration item when it is set
    hash: 89f5400674d4eb93b56dbc428aaa3c5300bfa2bb88a2a7bfe0ed309b7b96358a
  E02:
    record: sys_declarative_action_assignment/5de0705e439e42102e5e1febb7b8f23f
    how: read Service dependency view
    result: a field action on Service
    hash: 05805ffb16bde6df2513fc95b706f9aff7a09c28c906d220c22986c78d5e5781
  E03:
    record: sys_script/6f8daf204a3623120146c79f308310df
    how: read Sync CI with Affected CIs
    result: the ticket's CI is kept in its Affected CIs
    hash: 16969241b5aa614c687dbc7453668d7c62e091abd7388b228a664e44039bf364
  E04:
    record: sys_script/08cf6ffe23203300a5eedc1756bf657f
    how: read Refresh Impacted Services (change)
    result: refreshes the impacted services from the affected CIs
    hash: f14bef4c1468e1422361c5bf2e3c05bf3a5b7c7b9d270649187246368b5fd086
  E05:
    record: sys_properties/75e8df71874010100e3dd61e36cb0b6e
    field: value
    how: read com.snc.incident.refresh_impacted.include_affected_cis
    result: false for incidents
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E06:
    record: sys_ui_action/807e83d1878010100e3dd61e36cb0b89
    how: read Refresh Impacted Services (incident)
    result: form menu
    hash: 32233bd4c9474f0594a8491efcae1e224d05754651c3becd019e838393dc3f3a
---
## The dependency view

In the workspace, the field actions **CI dependency view** and **Service dependency view** beside
those fields show what the CI depends on and what depends on it. [E01] [E02]

## Affected and impacted

- **Affected CIs** lists what the ticket touches; its own CI is added for you. [E03]
- **Impacted Services/CIs** lists the services hit. On a change it is refreshed from the affected
  CIs [E04]; on an incident use **Refresh Impacted Services** in the form menu, which leaves the
  affected CIs out. [E05] [E06]
