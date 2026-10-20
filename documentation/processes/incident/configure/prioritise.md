---
title: Priority - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: dl_definition/302849102b031000de0aba36a3fd5631
    how: read Priority Lookup
    result: source incident, matcher dl_u_priority; run on form change, insert and update; matches impact and urgency; sets priority, always replace
    hash: 9ce013173c49e78eb1f7963690a52ff2fc96c9a822f4ab3bf778ab32b7c91735
  E02:
    record: sys_ui_policy/3f004001a7102000dada192bd9acf4bf
    how: read the UI policy and its action
    result: no condition, on load; priority disabled
    hash: 26f0741eb6f0490c97755976b12ab8af2605007e9d964fb4ec4de250bebfae92
  E03:
    record: sys_db_object/1521b6f78c5103100a22deb6dd2b4e61
    how: read task choices for impact, urgency and priority
    result: impact and urgency 1 High, 2 Medium, 3 Low; priority 1 Critical, 2 High, 3 Moderate, 4 Low, 5 Planning
    hash: 343f7b08c3068250e834d709bd7429dc20030077b328e63fe0b068e83704b68c
  E04:
    record: sys_script_client/ed5392f3c3122200b6dcdfdc64d3ae96
    how: read Worknotes mandatory onChange of priority
    result: work notes mandatory when priority changes on an existing incident
    hash: 85e1e0ad4eb9c3abd45d92b342ccb970bc5edae319c7179f8ac28b106d849498
  E05:
    record: sys_script/d56b5d71c0a80164019d0e0be2cf784f
    field: script
    how: read the after rule incident events
    result: queues incident.priority.1 when priority changes to 1 (and incident.severity.1)
    hash: 43f49732c59f735f1a33b618eafb3718f56fe7a550ab86f81d190993581388b2
  E06:
    record: sysevent_email_action/2a811dee7f0232005f58108c3ffa9111
    how: read Incident Priority Raised
    result: triggered (flow or script), to the assignee, "priority raised to ${priority}"
    hash: 1e8ace78d42d07d4ca263829058eaa60773e1f3a252917e63a03765e246630e0
---
## How priority is computed

Data lookup on impact and urgency [E01], field read-only [E02], choice values [E03]. The matrix
(table `dl_u_priority`, 9 active rows) is the one on the guide page; priority 5 (Planning) is
never produced.

## On change

Work notes become mandatory [E04]; a change to priority 1 queues `incident.priority.1` [E05], which nothing in the mirror listens to. [Q21] *Incident Priority Raised* is a triggered notification [E06], but no flow or script calling it was found. [Q22]
