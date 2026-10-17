---
title: Watch CMDB quality
reviewed: 2026-10-17
evidence:
  E01:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'CMDB Workspace home › CMDB Health'
    how: 'read the health card'
    result: 'CMDB Health Dashboard jobs haven''t been run'
  E02:
    record: sysauto_script/cfbb4ba1d7001200c1ed0fbc5e6103a6
    how: read CMDB Health Dashboard - Completeness Score Calculation
    result: inactive
    hash: 2638c0ccf45454f51861a5542b85bdf2f7fc41044f256797e60a0838d41ba062
  E03:
    record: cmdb_health_staleness_rule/7364ba338c5503100a22deb6dd2b4e36
    how: read the staleness rule
    result: cmdb_ci, 60 days
    hash: d9c8c84e68fb8c159a7983798a460d42b09a7bf1727e74740d6c14c7a6439d15
  E04:
    record: sys_app_module/38bd98209f733100d3921a1cf67fcf43
    how: read De-duplication Tasks
    result: the duplicate CIs found
    hash: 374d8a1dd051b9ea1d8ff8373444f65856f54f5d4118ef9d515aaa29e3b125b0
  E05:
    record: cmdb_data_management_policy/e23d4a9973f2701026f6aa114df6a741
    how: read Dependent CI Archival
    result: the only kind of Data Manager policy, for dependent CIs
    hash: 04032efce2ba32408461bbb1827f2b25e95344e3d0f84020401dc43553399e49
---
## Health {label=OPEN-QUESTION}

{{animation:cmdbqual}}

The CMDB Workspace shows a **CMDB Health** card, but on pdi2 *"CMDB Health Dashboard jobs haven't
been run"*: the score jobs are switched off. [E01] [E02] A CI is stale after 60 days without an
update. [E03] Turn the jobs on to get scores.

## Duplicates

**Configuration › De-duplication Tasks** lists CIs found twice; remediate them from the CMDB
Workspace. [E04]

## Retirement and archiving

The Data Manager has only the *Dependent CI* policies [E05]: no attestation, retirement or
certification policy is set up.
