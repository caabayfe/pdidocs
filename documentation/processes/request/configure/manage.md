---
title: Requests - configuration
reviewed: 2026-10-19
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
  E08:
    record: sys_declarative_action_assignment/fe5ba717a33002100c5c9fbca51e6156
    how: read New (sn_sow_req), action create-new-uxf
    result: 'table sc_task, related list model, specificity 21, create_access true, script condition parent.active == true; client action Create new record (sys_declarative_action_payload_definition 08913e7273131010a0a79329faf6a78b) with payload table, sys_id -1 and the list query'
    hash: cbe4fe6544eb0cd295aa312b698ab6b943eb7f006fb10a88557cb25913f32e3a
  E09:
    record: sys_ui_related_list/065d3507533230104a06ddeeff7b12ef
    children: sys_ui_related_list_entry
    how: read the workspace Requested item related lists (sn_sow_req)
    result: 'sc_task.request_item (Catalog Tasks), sysapproval_approver.sysapproval, sysapproval_group.parent and one REL relationship'
    hash: 0f18e4b707dbc44658e30f64f37b70466959c9b04beed0aaf91b408fcd13fa20
  E10:
    record: sys_security_acl/68224ff78c5143100a22deb6dd2b4e4c
    how: read the sc_task create ACLs (with sys_security_acl bae0a438491c1210f8773a7cf71c52c9) and their roles
    result: 'allow: role catalog_admin, admin overrides; the other is a deny unless the user is authenticated'
    hash: 29b6bc575efda4fe9c3a424846e617c139079396d9a343d76d117139e32bf215
  E11:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    children: sys_hub_action_instance_v2
    how: decoded the four Create Catalog Task steps of Service Catalog item request
    result: 'Please fulfill this order (Procurement), Please deploy item to the user (Field Services, in both branches), Please close this task once the backordered item arrives (Procurement); all with wait true'
    hash: 55678916ab4252c14088760dd6fc8e35fb0b1d42499265535dad4f82911c32a0
  E12:
    record: sys_script/8c6f35519330220042cf530b547ffb29
    how: read the sc_task business rules that fire on insert
    result: 'Populate parent field in sc_task table (parent = request item), Auto Populate Request Field (sys_script 3fadac3cc3523000c111113e5bba8f51), Set Actual Start Time (sys_script bb21a570531320101d8fddeeff7b12c4); none of them tells the flow'
    hash: d2ab6f73a801eab2e95fa36632408d4d65d04622585406ca37850e777e87a736
  E13:
    record: sys_script/180430660a04bf1500f82aaba735fe7f
    field: script
    how: read Close Tasks Due to Cancellations
    result: sets state 4 on every sc_task whose parent is the cancelled item
    hash: f2fd0614a23bff4580c59cf427c24d5406cdef18d1012eebc17a61608213cb18
  E14:
    record: sys_ui_action/923920ccc0a8010a0013cceac7f07994
    how: read Copy (global, sc_request)
    result: 'server side, form button and workspace form button, show on update; condition GlideappScriptHelper().hasAllActiveItems(current); roles admin and catalog_admin (sys_ui_action_role 776931e3c3511200f7d1ca3adfba8f5c, bf8971e3c3511200f7d1ca3adfba8fb3)'
    hash: a481a98edf8e0b590cb173477b986fa704533c6e2aa161fb9460387bde7a11f7
  E15:
    record: sys_ui_action/951a0121c3212100c8b837659bba8ffd
    how: read Copy (global, sc_request), the partial copy
    result: 'client, same buttons; condition hasPartialActiveItems(current); alert "Some items are inactive and will not be copied", then submits; roles admin and catalog_admin (sys_ui_action_role 417931e3c3511200f7d1ca3adfba8fa3, 3aa9b1e3c3511200f7d1ca3adfba8fcc)'
    hash: 3281f3a288b0b0f6fb7bc9e879200f85a41eb8197755cc5cddb1f403d33c66a9
  E16:
    record: sys_ui_action/951a0121c3212100c8b837659bba8ffd
    field: script
    how: read the server script shared by both Copy actions
    result: 'GlideappScriptHelper.copyRequest(current); info "Request copied successfully"; opens the new request; CatalogExceptionUtils shows cart errors'
    hash: 5dea46f4629501d222b1aa4f91ad786ce90f230a352f145bd5340fa86857df2d
  E17:
    record: sys_ux_form_action/4d275ce3c7c230105a06a1e603c26069
    how: read the workspace form actions Copy (sn_sow_req), with sys_ux_form_action a7089427c7c230105a06a1e603c2605c and their layout items in the Request layout
    result: 'one per UI action, specificity 20, active, not in the overflow menu'
    hash: 527eed1e97e5a97ad600f678439e0791eb33706437dfad559d2669aee334c9b0
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
they use the Now Mobile app. [Q07]

## Catalog Tasks › New on a requested item {label=NEW}

| Step | Record | What it does |
|---|---|---|
| 1. Shown | declarative action *New* (`sn_sow_req`) on the item's Catalog Tasks list [E08] [E09] | needs the item active and the right to create `sc_task` [E08] |
| 2. Who | `sc_task` create ACL [E10] | `catalog_admin` (and admin) only [Q04] |
| 3. Opens | client action *Create new record* [E08] | a new catalog task with the list's query, so `request_item` is set |
| 4. Saved | business rules on insert [E12] | parent and request filled, actual start set |

The flow *Service Catalog item request* creates its tasks with *wait* on, each step waiting for
its own task. [E11] Nothing in the mirror ties a hand-made task to the flow, so it neither
blocks the next flow task nor the item's completion. [Q18] [Q09] Only cancellation reaches it: *Close
Tasks Due to Cancellations* closes every task of the item. [E12] [E13]

## Copy on a request {label=NEW}

| Record | When | Effect |
|---|---|---|
| UI action *Copy*, full [E14] | every item's catalog item is active | copies |
| UI action *Copy*, partial [E15] | only some are active | warns, then copies without the inactive ones |
| shared server script [E16] | | `GlideappScriptHelper.copyRequest`, then opens the new request |
| workspace form actions [E17] | | put both in the SOW request header |

Both are limited to `admin` and `catalog_admin`. [E14] [E15] [Q05] `GlideappScriptHelper` is platform
code, so the mirror can't show what the copy carries over (items, variables, requested for) or
whether the new request's flows and approvals start from the beginning. [E16] [Q17]
