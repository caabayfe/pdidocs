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
    result: 'when the problem is resolved with Fix Applied, resolves its incidents On Hold for Awaiting Problem with "Related problem … closed."; with Risk Accepted, only adds an internal note'
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
a **problem** to remove it. This page says what you see while you wait.

## Before you start

- You don't need to do anything to start this: the service desk decides when an incident waits
  for a problem.
- Keep your incident number. Your incident stays yours; nothing new is opened in your name.

## Follow it

1. Open your incident in Employee Center. Its state shows **On Hold**, waiting for the problem.
   [E01]
2. Wait for the fix: you don't need to chase it.
3. When the fix is in, your incident is resolved by itself: its activity says *"Related problem …
   closed."* and you get the usual *"… was resolved"* email. [E02] [E03]

## What happens next

Try what didn't work. If it works, there is nothing more to do. If it still doesn't work for you,
reopen your incident as usual (see [Confirm the fix, or reopen](see:incident/confirm)).

If the team decides the cause isn't worth fixing, your incident isn't resolved by itself: the
support team finishes it with you. [E02]

## Emails you get

| When | Email |
|---|---|
| The fix is in and your incident is resolved | *"… was resolved"* [E03] |

## Tips

- A way to keep working may exist before the fix: the support teams receive it, not you. [E04]
  Ask on your incident whether there is one.
- If the problem is getting worse for you, add what you see to your incident's **Activity**
  rather than reporting a new incident.

## I want to…

| I want to… | Go to |
|---|---|
| follow my incident | [Follow your incident](see:incident/follow) |
| reopen it after the fix | [Confirm the fix, or reopen](see:incident/confirm) |
| report something new | [Report an incident](see:incident/report) |
