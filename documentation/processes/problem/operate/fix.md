---
title: Fix and resolve
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/ce8d6796871313000e3dd61e36cb0bba
    how: read Fix
    result: to Fix in Progress; asks for cause notes and fix notes
    hash: 953bbab9e563ddb7b9e7c47a0c19e697383cd1044bda8bef4e984b2914591d68
  E02:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic problem form, PRB0007601, context menu'
    how: 'opened the form menu'
    result: 'Create Outage, Create Normal Change, Create Standard Change, Create Emergency Change, Create Known Error article'
  E03:
    record: sys_ui_action/713301ac874823000e3dd61e36cb0b8e
    how: read Communicate Fix
    result: when fix notes are filled; message "Fix communicated"
    hash: 0e3fdf3eb4d5d67c43230d02f8fc6080c19df6e720a5ef97141a16fa6060c1a0
  E04:
    record: sys_ui_action/8f43f31a871313000e3dd61e36cb0bf9
    how: read Resolve
    result: to Resolved with the resolution code Fix Applied
    hash: 94627ebfe976ad95e4c0d6cbd59423321e10225e84678b52bd16a7d9733c0ea5
  E05:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'incidents On Hold for Awaiting Problem: Resolved by problem, "Related problem … closed."'
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E06:
    record: sys_ui_action/5c98bf1a871313000e3dd61e36cb0b20
    how: read Complete
    result: from Resolved to Closed
    hash: 596a89a787ffed83376153f420bef958d1407f94166062dab5b50d87a3611f98
  E07:
    record: sys_properties/6cb745f5874023000e3dd61e36cb0bc8
    field: value
    how: read problem.closed.cancel_open_tasks
    result: true; closing cancels open problem tasks
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
---
## Plan the fix

{{animation:prbfix}}

When the cause is known, press **Fix** and fill in the **Cause notes** and **Fix notes**. [E01] If
the fix changes a system, raise the change from the form menu: **Create Normal Change**, **Create
Standard Change** or **Create Emergency Change**. [E02] Then choose **Communicate Fix** to put the
fix notes on linked incidents. [E03]

## Resolve

When the fix is in, press **Resolve**: the resolution code is *Fix Applied*. [E04] Every linked
incident **On Hold - Awaiting Problem** is resolved now, with the code *Resolved by problem*, and
its caller is told. [E05] Incidents that are only linked stay with their teams.

## Complete

Once the fix has proved itself, press **Complete** to close the problem. [E06] Open problem tasks
are canceled. [E07]
