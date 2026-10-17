---
title: When a problem is behind your incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident on hold reasons
    result: Awaiting Problem is one of them
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E02:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'resolves incidents On Hold for Awaiting Problem when the fix is applied; notes "Related problem … closed."'
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E03:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: '"… was resolved", to the caller'
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E04:
    record: sys_properties/106170f54324561085678772d9b8f2ff
    field: value
    how: read com.snc.incident.communicate_prb_workaround_to_inc_worknotes
    result: true; workarounds go to the support team only
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## Your incident waits for a fix

{{animation:prbaffected}}

Sometimes your incident can't be fixed on its own: the cause is bigger, and the service desk opens
a **problem** to remove it. Your incident then shows **On Hold**, waiting for the problem. [E01]
You don't need to do anything, and you keep your incident number.

## When the fix is in

When the problem is fixed, your incident is resolved by itself, with the note *"Related problem
… closed."*, and you get the usual *"… was resolved"* email. [E02] [E03] If it still doesn't work
for you, reopen it as usual (see [Confirm the fix, or reopen](see:incident/confirm)).

## Meanwhile

A workaround found by the problem team reaches the support teams as an internal note, not you.
[E04] If you need to keep working, ask on your incident whether there is a workaround.
