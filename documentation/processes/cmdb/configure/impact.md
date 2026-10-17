---
title: Affected and impacted - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/429f991b0b323200ed45478d83673ac5
    how: read Sync BS with Impacted Services
    result: keeps the ticket's service in its impacted services
    hash: 9cc1459214f930f3891c27fad6f0cafc5d1f24777d03b68f76fd9768f2326f8a
  E02:
    record: sys_properties/357e737623d023001488dc1756bf65fb
    field: value
    how: read com.snc.change_request.refresh_impacted.include_affected_cis
    result: true
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E03:
    record: sys_properties/f1f9c2fed72111005e8da3eb5e61037e
    field: value
    how: read glide.bsm.max_levels
    result: 3 levels in the classic map
    hash: 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce
---
## Sync and refresh

The service is kept in the impacted services [E01]; changes include affected CIs when refreshing
[E02], incidents don't. The classic map shows 3 levels. [E03]
