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
    how: read Communicate Fix (related link and form menu)
    result: 'when fix notes are filled and the form is saved; stamps who and when; message "Fix communicated"'
    hash: 0e3fdf3eb4d5d67c43230d02f8fc6080c19df6e720a5ef97141a16fa6060c1a0
  E04:
    record: sys_ui_action/8f43f31a871313000e3dd61e36cb0bf9
    how: read Resolve (form button)
    result: sets the state Resolved and the resolution code Fix Applied, and saves
    hash: 94627ebfe976ad95e4c0d6cbd59423321e10225e84678b52bd16a7d9733c0ea5
  E05:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: 'runs on every problem state change while the code is Fix Applied: incidents On Hold for Awaiting Problem get the fix notes as a work note and are resolved with Resolved by problem, "Related problem … closed."'
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
  E08:
    record: sysevent_script_action/eda3a490534123004247ddeeff7b123d
    field: script
    how: read Copy Prb fix to Inc work notes (on communicate.fix)
    result: 'linked incidents up to Resolved get the work note "Proposed/Planned fix shared from PRB…: …"'
    hash: 62a7d0b6bde1f891b9335a318b12476f3e3059028cb737fa15b128ab4413b730
  E09:
    record: sysevent_email_action/1884091c534123004247ddeeff7b1226
    how: read Incident resolved by Problem (ITIL)
    result: to each resolved incident's assignee
    hash: 11658b5b65ea6295f5d6645f4589ea46915be473d785522872f3e67997d4fc43
  E10:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: '"… was resolved", to the caller'
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E11:
    record: sys_ui_script/592479f30b4123005775aabcb4673a32
    field: script
    how: read ProblemModalUIHelpers (onFix, onMarkDuplicate, onAcceptingRisk, problem_Cancel)
    result: 'sets the new state; saves at once when the required fields are filled, otherwise opens a dialog (Fix: Cause notes, Fix notes)'
    hash: cfa7f1a91891d9e5e40859bed927383e378c3d615ad5cb26814fdfcc756de0f8
  E12:
    record: sysevent_email_action/1e8daa5f9f2202008f97b89a442e70a4
    how: read Problem Closed
    result: '"Your problem … has been closed", to whoever opened it'
    hash: f6879a0478f7750f11e6a89c4335c1c82b838d1b17f041b8a5f7f5d6c5841894
---
## Plan the fix

{{animation:prbfix}}

All of this happens on the **classic problem form**.

1. When the cause is known, press **Fix**. If **Cause notes** or **Fix notes** are still empty,
   the **Fix** dialog asks for them; otherwise the form saves at once. The problem moves to **Fix
   in Progress**. [E01] [E11]
2. If the fix changes a system, raise the change from the form menu: **Create Normal Change**,
   **Create Standard Change** or **Create Emergency Change**. [E02] Then follow
   [Raise a change](see:change/raise).
3. Save the form, then choose **Communicate Fix** (related link or form menu). You see *"Fix
   communicated"*. [E03] Every linked incident still open gets the work note *"Proposed/Planned
   fix shared from PRB…: …"* with your fix notes. [E08]

## Resolve

1. When the fix is in, press **Resolve**. The problem moves to **Resolved** with the resolution
   code *Fix Applied*. [E04]
2. At that moment, every linked incident **On Hold - Awaiting Problem** gets your fix notes as a
   work note and is resolved with the code *Resolved by problem* and the note *"Related problem …
   closed."* [E05] Its assignee is emailed [E09] and its caller gets *"… was resolved"*. [E10]

Incidents that are only linked, not on hold, stay with their teams: resolve them yourself or ask
their teams to.

## Complete

Once the fix has proved itself, press **Complete** to close the problem. [E06] Open problem tasks
are canceled. [E07]

## What happens next

Closing the problem emails whoever opened it: *"Your problem … has been closed"*. [E12] If the fix doesn't hold, **Re-Analyze** sends it back
to root cause analysis (see [Accept the risk, cancel or reopen](see:close)).

## Tips

- Write the **Fix notes** for the incident teams: they receive them word for word. [E05] [E08]
- Put incidents on hold for the problem before you resolve it, or they won't be resolved with it
  (see [Link incidents to a problem](see:link)).
