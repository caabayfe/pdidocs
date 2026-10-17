---
title: Implementation - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_hub_flow/1f54be96731310108ef62d2b04f6a7d7
    how: read Change - Normal - Implement
    result: runs the implementation tasks subflow; cancels flow tasks when the change reaches Review
    hash: d242cc2454572845a908ca063f6da5c42a94a80cde9a865a40cb4ff69ae83c2f
  E02:
    record: sys_hub_flow/6bcd6a92731310108ef62d2b04f6a790
    how: read Change - Implementation tasks
    result: creates Implementation and Post Implementation tasks
    hash: 2309133b0b7a04ce706d8f00de23fac5b74f1a3dcbb1dbcceea63f832dcbf0ec
  E03:
    record: sys_script/eeeb0f59d7410200d82ba1737e6103b1
    how: read Update Conflicts
    result: queues conflict detection on state, CI or date changes
    hash: c9284ed4578e417bee51b5daa29baf80a75ee993b9240855e643a3ca4a5a377c
  E04:
    record: sys_ui_action/d3668ab84a36232b00bbd765d0e94336
    how: read Check Conflicts
    result: inactive
    hash: 22ade70a2af94af1dc56a04a8fb629bc8a694d35f8bbd67eb50a4eaf772cddc4
  E05:
    record: sys_properties/8839089d0a0a2c3e22a1770ed1b7ecc4
    how: read change.conflict.mode
    result: value not in the mirror
    hash: 6630d2320b3ea594b489d67f02aa1090cccb2781753a57019ac5aa02f53fda6b
  E06:
    record: cmn_schedule_blackout/83cd9a930a0a2c3e6d4957fe9651c24d
    how: read Blackout Wednesdays (GMT)
    result: demo blackout schedule
    hash: 7a4d3357ea726c9a6fad74a55f8db62d63b427738bfad079ea85c0d5d0de82db
---
## Tasks

Implement runs a subflow that creates *Implementation* and *Post Implementation* tasks [E01] [E02].

## Conflicts {label=OPEN-QUESTION}

Conflicts are checked automatically on state, CI and date changes [E03]; the manual link is
inactive. [E04] The conflict mode and its options aren't in the mirror [E05], and the blackout and
maintenance schedules are demo data [E06]: check which windows are real.
