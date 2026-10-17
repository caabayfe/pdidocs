---
title: Resolve an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/38c073d7465762820116c37c3353540f
    how: read the Resolve button
    result: shown while the incident is not Resolved, Closed or Canceled, to agents and to the caller
    hash: 104a1abc88fed62719f58700b3686e2b9fcdba582481a241c9b90c7f1b8e25e4
  E02:
    record: sys_script_client/5f254623c0a8016600c9b86f18b348f0
    how: read (BP) Close Mandatory on Close or Resolve
    result: resolving needs a resolution code and resolution notes
    hash: 3a62a4350d4687f3cdfd924963b80ddd018948facce606509fc0baf8a98f36e0
  E03:
    record: sys_script/74dc2340533230108b91ddeeff7b1230
    how: read Check if Known error article required
    result: the code Known error needs a Known Error article attached
    hash: e27275eebab1118ed7bc6b59494707f84a8433c708c486560690b17827aa4ac3
  E04:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: emails the caller that the incident was resolved
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E05:
    record: sys_declarative_action_assignment/127dba4b77733010e35c06e57b5a9949
    how: read the workspace action Resolve
    result: primary header button; opens a Resolve dialog and sets the state to Resolved
    hash: a775657bb79f7d419decdd8fd483dc56fdb6ebf618ac824e6b5da8628044e121
  E06:
    record: sys_ui_section/90285cf453c131102f10ddeeff7b12bf
    children: sys_ui_element
    how: read the Resolve dialog's form section
    result: resolution code, resolution notes, and parent incident
    hash: 3499675d1e7552960a467747a1b75b7d0347419173bb33f2acb0c775a262a998
  E07:
    record: sys_ui_policy/b3dbdcf853c131102f10ddeeff7b12f4
    how: read Show and make Parent incident mandatory if Resolution code is Duplicate
    result: Duplicate needs a parent incident
    hash: b8952dc61276b84bf6d047fa993f3ddb504669691160058e6579411fa33203eb
  E08:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the resolution code choices
    result: ten codes, Duplicate to Workaround provided
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E09:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic incident form, INC0009004, Resolution Information'
    how: 'read the section''s field labels'
    result: 'Resolution code, Resolution notes'
---
## When to resolve

When the caller can work again: the fault is fixed, or a workaround is in place and agreed. If
you're only waiting for confirmation, resolve it; don't leave it In Progress.

## Resolve it

1. Open the incident in the workspace and press **Resolve** in its header. [E05]
2. In the **Resolve** dialog, fill in: [E06]
   - **Resolution code**: what kind of fix it was;
   - **Resolution notes**: what you did, in words the caller understands. They read this.
3. Press **Resolve**. The incident is **Resolved**, and the caller is emailed. [E04]

*Classic form:* press **Resolve**, then fill the same two fields in **Resolution Information**
and save. [E01] [E02] [E09]

## Choosing the resolution code

The codes [E08]:

| Code | When |
|---|---|
| **Solution provided** | you fixed it |
| **Workaround provided** | the caller can work, the root cause remains |
| **User error** | it worked as designed; you showed the caller how |
| **Resolved by caller** | the caller fixed it themselves |
| **Resolved by change** | a change fixed it (link it) |
| **Resolved by problem** | a problem fix solved it (link it) |
| **Resolved by request** | the caller needed a request instead (link it) |
| **Duplicate** | another incident covers it: the dialog then asks for the **Parent incident** [E07] |
| **Known error** | a known error article describes it; **attach the article first** [E03] |
| **No resolution provided** | it can't be fixed, and the caller agrees to stop |

## What happens next

The caller has time to confirm or reopen. Then the incident is closed, by the caller, a team
lead, or automatically after 7 days (see *Close, reopen or cancel an incident*). Child incidents are
resolved with their parent.

## Tips

- Resolution notes are the most-read part of an incident later: say what the cause was, what
  fixed it, and what to do if it happens again.
