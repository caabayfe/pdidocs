---
title: Link incidents to a problem
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_section/991fec850a0006417c9edda2d4e9c487
    children: sys_ui_element
    how: read the incident form's Related Records section
    result: parent incident, problem, change request, caused by
    hash: 526106c5de8d52363e7206a84285e6340d6a053bcea1c13b9525361fdf9964f7
  E02:
    record: sys_ui_section/8f2f419653533010ae50ddeeff7b1248
    children: sys_ui_element
    how: read the workspace incident form's Related Records section
    result: parent incident, problem, change request, caused by
    hash: 162ed219efd66183c54b7b956d797d2526aae8c5c5fa4cef4de1ad551821edfa
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic problem form, PRB0007601, related lists'
    how: 'read the related list tabs'
    result: 'Affected CIs, Problem Tasks, Change Requests, Outages, Attached Knowledge; no Incidents list'
  E04:
    record: sys_ui_policy/d8e02184c3b30200b6dcdfdc64d3ae30
    how: read the incident On Hold policy
    result: On Hold needs an on hold reason
    hash: b8f1c64dc520d3681d801aafa742de23113ce6d8a0158d2ec3c12f7e85321a48
  E05:
    record: sys_script/12267f44537630108b91ddeeff7b12b7
    field: script
    how: read Update incident from known error
    result: attaching a known error article to an incident links the incident to the article's problem
    hash: fb476ee0d519f1be58a3bb92529a48b354c67e88f0b92e35559d4d5e363e1ac1
  E06:
    record: sys_security_acl/a21542c7ffe47210549fffffffffffca
    how: read the write ACL on incident.problem_id for closed incidents
    result: only problem coordinators may link a closed incident
    hash: 6c2a444b032725a2fed8f5ea0660cb1c3219b255979970c876db2721c93d8fb0
---
## Link from the incident

{{animation:prblink}}

Open each incident and set **Problem** in its **Related Records** section, on the classic form or
in the workspace. [E01] [E02] The problem form doesn't list its incidents on pdi2, so link from the
incident side. [E03]

Only a problem coordinator can link a closed incident. [E06]

## Put the incident on hold

If the incident can only be fixed by the problem, set its **State** to **On Hold** with the reason
**Awaiting Problem**. [E04] When the problem is fixed, it is resolved for you (see
[Fix and resolve](see:fix)). An incident that is only linked, not on hold, stays with its team.

## A shortcut through knowledge

Attaching a problem's **known error article** to an incident links the incident to that problem.
[E05]
