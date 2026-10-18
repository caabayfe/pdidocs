---
title: Requests - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ux_form_action_layout/50d15cefc78230105a06a1e603c2603a
    how: read the workspace Request header layout
    result: Cancel Request, two Copy actions, Send SMS, Copy URL
    hash: 6d136774948828c38140abf3140531b3d7b3b8d7de20863c7e86ea064022de24
  E02:
    record: sys_ux_form_action_layout/da7120c8eb8b2110dd0583402a5228ac
    how: read the workspace Request Item header layout
    result: only Send SMS and Copy URL
    hash: b4a14f8247e1c6fa05b7a5bc15816139ab008e03a53f18c12307cf86ade4b73a
  E03:
    record: sysevent_email_action/2bf1538377223010f088a0e89e5a99fb
    how: read Request Rejected (global)
    result: on request_state changing to closed_rejected
    hash: 234796e84ec819b04c11f149e1242870ac2a43a318c572eaa852fc14481c1627
  E04:
    record: sysevent_email_action/db07d5ea0fe433001befa68ca8767edc
    how: read Request Rejected (Now Mobile, scope sn_scmobile)
    result: 'same condition and recipients (requested for, opened by); push_message_only true and an empty subject: a push notification to the Now Mobile app, not an email'
    hash: e32d8b4a0f534f38ee2aa9bbd988d19bcd92dba8947086a301aaf8f0db4d90c9
  E05:
    record: sys_script/2d0885b4c61122840070856bf5994bca
    field: script
    how: read Cascade Request Approval to Request Item (after insert and update, order 1300, when approval changes)
    result: CatalogRequestUtil.cascadeRequestApproval passes the request's approval, rejection or cancellation down to its items
    hash: 90a95ddf646410d82ee8c74a27b9438fbd83d1cafa4270aa2c2e3f8993ba6506
  E06:
    record: sys_script/40afa110c611228401d8643e2c2748cb
    field: script
    how: read Mark Request Closed (before insert and update, order 1200)
    result: on request state closed_complete, closed_incomplete, closed_cancelled or closed_rejected, or a closed stage, makes the request inactive, sets closed by, closed at and durations, and maps the state (complete 3, skipped 7, otherwise 4)
    hash: 3975c4a268e4cd2762eb91fcf4d2ef680e296c4127da9ade43b67dd64351c380
  E07:
    record: sys_script/4fc071d89381a6101ba7f2f17cba100f
    field: script
    how: read Cancel Flows Upon Cancellation (after insert and update, order 100, when the state changes to 4)
    result: 'cancels every flow context of the request with "Due to request cancellation by <user>"'
    hash: 0f3a037cac209608e3f9105b26b592236deab60dd491f3bad28d37024f1d005b
---
## Headers

The request header has *Cancel Request* [E01]; the item header has no close or cancel action.
[E02]

## Server-side rules on the request

| Rule | When, order | Condition | Effect |
|---|---|---|---|
| **Cancel Flows Upon Cancellation** | after insert and update, 100 | the state changes to *Closed Incomplete* (4) | cancels the request's flows, *"Due to request cancellation by …"* [E07] |
| **Mark Request Closed** | before insert and update, 1200 | a closed request state or stage | inactive, closed by and at, durations; state *Closed Complete*, *Closed Skipped* or otherwise *Closed Incomplete* [E06] |
| **Cascade Request Approval to Request Item** | after insert and update, 1300 | the request's approval changes | its items get the same approval, rejection or cancellation [E05] |

So **Cancel Request**, which sets *Closed Cancelled*, ends as state *Closed Incomplete* through
*Mark Request Closed*, and that state change cancels the flows. [E06] [E07]

## Rejection notices

When a request becomes *Closed Rejected*, two notifications fire on the same condition: the
*Request Rejected* email [E03], and the Now Mobile *Request Rejected*, which is a push
notification only (no email, no subject). [E04] Requesters get one email, plus a push message if
they use the Now Mobile app.
