---
title: The life of an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/b0e4363b8c5503100a22deb6dd2b4e97
    children: sys_choice
    how: read the incident's choices (state, on hold reason, resolution code)
    result: states New, In Progress, On Hold, Resolved, Closed, Canceled; on hold reasons Awaiting Caller, Awaiting Change, Awaiting Problem, Awaiting Vendor
    hash: 438604df7c0701185679ccf5f78a95effda35ae621060096b2ab78a53ec5cac2
  E02:
    record: request_filter/e3f9f9b3871023000f220cf888cb0bf4
    how: read the Incident Portal request filter and the ticket configuration
    result: Employee Center shows the same state names
    hash: 9290157a76df5801a26c7fce47282129e5d43b20bfbac33dee2c79965a95d152
  E03:
    record: sys_script/162581e087133200b4ae6c5837cb0b1a
    how: read Incident State Change to In Progress
    result: a caller's comment while Awaiting Caller puts it back to In Progress
    hash: f4a62fc198d894d826c0208e5e0e606e78139e16118c59d6c52e02bd8be29828
  E04:
    record: sysevent_email_action/4d505448e5aeb410f8777565f90b2f13
    how: read Incident resolved
    result: the resolution email says the incident closes automatically after a set time
    hash: 0a29cfd91220c1341af6b005a02c3c4a0101ab6cf06225293763356b72f60e87
  E05:
    record: sys_ui_policy/66f94c730a0a0b0900aaaf5b88527230
    how: read Make fields read-only on close
    result: a Closed or Canceled incident can no longer be edited
    hash: a9139005c8e4553f7d4f8e96a76365317b33fb2ff79b68088115f68e9fe98197
  E06:
    record: sys_ui_policy/d8e02184c3b30200b6dcdfdc64d3ae30
    how: read the On Hold policy
    result: On Hold requires an On hold reason
    hash: b8f1c64dc520d3681d801aafa742de23113ce6d8a0158d2ec3c12f7e85321a48
  E07:
    record: sys_properties/d5c62446c0a8011800cdf450892cec2d
    field: value
    how: 'read glide.ui.autoclose.time'
    result: '7 days'
    hash: 7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451
---
## The states

Everyone sees the same state names, in the workspace, on the form and in Employee Center.
[E01] [E02]

| State | What it means |
|---|---|
| **New** | Reported; nobody is working on it yet. |
| **In Progress** | Someone is assigned and working on it. |
| **On Hold** | Waiting for something: the caller, a planned change, a fix for a wider problem, or a supplier. |
| **Resolved** | The fix is in. The caller can confirm it or reopen it. |
| **Closed** | Finished. It can no longer be reopened or changed. [E05] |
| **Canceled** | Not needed after all, for example a duplicate logged by mistake. |

{{animation:inclife}}

## What moves it on {for=user}

- When the service desk asks you something, the incident is **On Hold**. Your reply puts it back
  to **In Progress**. [E03]
- When it is **Resolved**, you get an email. Press **Close** if it works or **Reopen** if it
  doesn't. If you do nothing, it closes by itself after 7 days. [E04] [E07]

## What moves it on {for=operator}

| From | To | How |
|---|---|---|
| New | In Progress | someone is assigned and starts work |
| In Progress | On Hold | set **State** to *On Hold* and choose the **On hold reason**: *Awaiting Caller*, *Awaiting Change*, *Awaiting Problem* or *Awaiting Vendor* [E06] [E01] |
| On Hold - Awaiting Caller | In Progress | the caller replies; it moves back by itself [E03] |
| In Progress | Resolved | **Resolve**, with a resolution code and notes |
| Resolved | In Progress | **Reopen**, by the caller or by you |
| Resolved | Closed | **Close** by the caller or a team lead, or automatically after 7 days [E04] [E07] |
| any open state | Canceled | set **State** to *Canceled*, where your role allows it |
