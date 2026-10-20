---
title: Fulfilment - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read Service Catalog item request
    result: used by 36 active items; manager and department head approval subflows; Procurement and Field Services tasks
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E02:
    record: sys_hub_flow/1e1799df9f911210db9f618dfa0a1c70
    how: read Service Catalog Request
    result: on every new request; approval when the price is over $1,000
    hash: f42c3095a91862f726125149a8b7a3f51591df6e201e102685d5c739a2af5b67
  E03:
    record: sys_properties/ab598cf30a2581024c8e144473f204c8
    field: value
    how: read glide.approval_engine.sc_request
    result: 'off'
    hash: b4dc66dde806261bdda8607d8707aa727d308cd80272381a5583f63899918467
  E04:
    record: sys_script/596fac6bc0a8010a00dca5b76857e592
    field: script
    how: read Close Parent if Required
    result: closes the request when all items are closed
    hash: 1ea7f2d4c1812b85f56e342daf3d9e3ed591fd2725523fa77e94ed49d0160dd3
  E05:
    record: sc_cat_item_delivery_plan/980f2c70c611227800d9a7a6da3e5328
    how: read IT Service - General
    result: inactive, still set on active items
    hash: f3e821b09d8ff64ef70aee967131f08abf7a9b564c5d999ae02b118e9814472a
  E06:
    record: sys_hub_flow/8b7565139f151210db9f618dfa0a1c70
    how: read Service Catalog Request Price Approval
    result: '"This flow is a demo fulfilment flow."; creates no tasks'
    hash: 25365d4e87cfe0fd97f7a90bbc2ebc86c48d22cb2e87e7eaa74b241f438782ca
  E07:
    record: sys_script/da911513c0a8010a00f6dcc71ea864bd
    field: script
    how: read Reject Parent (sc_task, after insert and update, order 100)
    result: when a catalog task from an execution plan approval (sc_cat_item_dt_approval) is rejected and that approval is set to cancel on reject, sets the item's stage Request Cancelled and its approval rejected
    hash: 2c29e1f2b9fd44885af1fd5c3acf7d5682792ef0cb5af6aecde29a61b654b231
  E08:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    how: read Assign to me (sn_sow_itsm_common, table task)
    result: 'active, client, workspace form button (form_button_v2), show on insert and update, order 100; condition new sn_sow_itsm_common.SOWITSMCommonUtils().canAssignToMe(current)'
    hash: 1013cca37d22631f0ae734115f526063ee178a8df4ff7496cf05302af64e66bc
  E09:
    record: sys_ui_action_view/2c9e55d47733301027aae297cd5a995d
    how: read the view rules of Assign to me, with sys_ui_action_view d4e4c05a7733301027aae297cd5a990e
    result: included in the service-operations-workspace view and its new-record view
    hash: 4a6c121f2cffcfd07e7a1a9b83dbd1eded59255f02c39ef459b5a8d5a7bed58c
  E10:
    record: sys_ux_form_action_layout/82ab09b3c70630105a06a1e603c26073
    how: read the workspace Catalog task header layout (sn_sow_req)
    result: 'use_layout_items_only false: UI actions that qualify, such as Assign to me, show beside Close Task'
    hash: 7261ae93a4d6272136507aad856ed7b3d55d657191bae6ffc0a30a75b2ac197d
  E11:
    record: sys_script_include/31903c09c7f13010d7e818b1c7c2603d
    field: script
    how: read SOWITSMCommonUtilsSNC (canAssignToMe, canAssignToMeOnList, _checkRolesForAssignment)
    result: 'canAssignToMe: tables problem, incident, change_request, problem_task and sc_task; active or new; sc_task needs itil or sn_request_write; Assigned to writable and empty; group empty or the user a member. canAssignToMeOnList: problem, incident and change_request only'
    hash: 65116c33f05808534f0e490b4a150f944c6317f8ca8130bfef5664310e40685f
  E12:
    record: sys_ui_action/8513fcd0773b301027aae297cd5a9968
    field: client_script_v2
    how: read the client script
    result: 'GlideAjax SOWITSMCommonClientUtils.getMemberGroups; if the group is mandatory, empty and the user has several groups, a choice dialog "Select Assignment Group"; otherwise sets the only group when the field is empty, sets Assigned to and saves'
    hash: 37ee29255e26fd3b455b269904d2191825dbcf28efe396ec559ab135080479b0
  E13:
    record: sys_script_include/83d911b17763301027aae297cd5a993c
    field: script
    how: read SOWITSMCommonClientUtilsSNC._getMemberGroups
    result: 'active groups of the user whose type is empty or includes type 1cb8ab9bff500200158bffffffffff62; with com.snc.wfo active and several groups, the primary group only'
    hash: b5f2af9f1a8a652f524502ea9cc25038a03526b621df41259daf33b15b9501b0
  E14:
    record: sys_declarative_action_assignment/a9d63636ff30011027aaf9a7cddcbdc8
    how: read Assign to me - applicable to list in SOW (table task, list model, view service-operations-workspace, specificity 12)
    result: 'server script; script condition canAssignToMeOnList; overrides the global list action Assign to me (sys_declarative_action_assignment 7047f78453103300099addeeff7b1248, specificity 11, role itil)'
    hash: cced1a340ab4379d95705c1ec8fdbe481d96180fc5018540ab6fd429e7dc873d
  E15:
    record: sys_ui_action/4c1cfa36c611227501e6728036d9723b
    field: script
    how: read Assign to me (global, table task, list context menu, condition current.canWrite())
    result: sets assigned_to to the user and updates, with no group check
    hash: 1900b31af827768dc63d12e7aa7ffdab301d408aac8c4ac7891a19585e3bbf92
  E16:
    record: sys_script/c676425665596610f87741223d56ea09
    how: read Abort changes on group (sc_task)
    result: 'before insert and update, order 100, filter Assigned to not empty and Assignment group changes and not empty; aborts when the assignee is not a member'
    hash: ebc382be2ee07da3662c9773a7436705da198bdf937df8e8b07254bac10e0448
  E17:
    record: sysevent_email_action/039c7466c0a80102004f66ab6aa3e757
    how: read Email assigned to (sc_task)
    result: 'active, on insert and update when Assigned to changes (or work start changes), to assigned_to, send_self false'
    hash: b18dc7f294008300b75f2f40c17d6251fbe73d31686cf63fe4c499a36261fb30
  E18:
    record: sysevent_email_action/03973320c0a801020075d86be149dcbb
    how: read Email assigned to group (sc_task)
    result: 'active, when Assigned to is empty and the group changes (or work start changes), to the assignment group'
    hash: f823867473c46219c97ee1e5a76f7ed5ab49950a0c0aaea8cb49b8e49a94a5f2
---
## Assign to me on catalog tasks {label=NEW}

| Step | Record | What it does |
|---|---|---|
| 1. Shown | UI action *Assign to me* (`sn_sow_itsm_common`, table `task`) [E08], in the SOW views only [E09], placed in the catalog task header by its layout [E10] | condition `canAssignToMe`: active or new task, `itil` or `sn_request_write`, Assigned to writable and empty, group empty or the user a member [E11] |
| 2. Pressed | its client script [E12] with `getMemberGroups` [E13] | fills the group when it is empty and the user has one group; asks for a group only when the field is mandatory; sets Assigned to; saves |
| 3. Saved | *Abort changes on group* [E16] | checks membership only when the group changes |
| 4. Told | *Email assigned to (sc_task)* [E17] | not sent: the assignee is the sender and send to self is off |

The group dialog shouldn't appear on pdi2's catalog tasks: no UI policy, data policy or
dictionary override in the mirror makes **Assignment group** mandatory on `sc_task`. When the group is empty and the user is in several
groups, only Assigned to is set, and *Email assigned to group* doesn't fire either. [E12] [E18]

Lists: the workspace list action is overridden for the SOW view by one whose condition excludes
`sc_task` [E14] [Q08]; the classic list keeps a right-click *Assign to me* for anyone who can write the
task, with no group check. [E15] [Q06]

## Engines

The request flow handles the approval over $1,000 [E02] (the legacy approval engine is off [E03]);
most items use *Service Catalog item request* [E01]. The request closes after its items. [E04]

## Rejected task approvals

**Reject Parent** (on catalog tasks, after insert and update, order 100) only covers tasks from
legacy execution plan approvals: when such a task is rejected and its approval step is set to
cancel on reject, the item gets the stage *Request Cancelled* and is rejected. [E07] Flow-based
items don't use it.

## Gaps

- Items still point to inactive execution plans such as *IT Service - General*. [E05]
- Eight service items use a flow described as a demo that creates no tasks. [E06]
- Some items name legacy workflows the mirror doesn't hold, and nine have no fulfilment at all.

What each of them does when ordered isn't verified. [Q21]
