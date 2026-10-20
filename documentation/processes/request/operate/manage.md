---
title: Manage a request
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_ux_list/c1a01258c3753010965e070e9140dd31
    how: read Requests › Open requests
    result: active requests
    hash: bc59cc462be8450a70eeef288050774c131619c8aa74f658e083f3c1226d2f4d
  E02:
    record: sys_ux_list/39c0de18c3753010965e070e9140ddd3
    how: read Requests › Open items
    result: active requested items
    hash: f2c339b49a6f165312ebbd54875d7d341c30a026f95b295f40739a4fc07dfb93
  E03:
    record: sys_ui_action/180dfd110a04bf1501fc982f0cf791bb
    how: read Cancel Request
    field: script
    result: form button while the request state is requested or in_process; sets request state Closed Cancelled and stage closed_incomplete
    hash: 72aca974338373d09bdbb148d7c22f64a6bb9c8d5e44d25875d9e4ecf26464a4
  E04:
    record: sys_script/180430660a04bf1500f82aaba735fe7f
    how: read Close Tasks Due to Cancellations
    result: canceling an item closes its tasks
    hash: 4a5af44969c0b1e25b6a53e859f76d6b3247a161940ff025dac6c94be13017ab
  E05:
    record: sys_ui_action/0c4c19670a0a0a7001101d92fa2649da
    field: script
    how: read Add New Item
    result: 'classic form button while the request state is requested; opens the dialog "Add Catalog Item" asking an item and a quantity'
    hash: 842fce36e27915f08a01e5b8190e93af720a5468f776252f91d8f8579dc71a19
  E06:
    record: sys_ux_list/a91ea05b9351121004e40b2764891806
    how: read Approvals › My approvals
    result: includes request and item approvals
    hash: fc69db4d74ecb8b75d2f83e659d7192eead58821ddf0bd3375297539ac46e4c4
  E07:
    record: sys_script/4fc071d89381a6101ba7f2f17cba100f
    field: script
    how: read Cancel Flows Upon Cancellation (after, order 100, when the state changes to Closed Incomplete)
    result: 'cancels the request''s flows with the message "Due to request cancellation by <user>"'
    hash: 0f3a037cac209608e3f9105b26b592236deab60dd491f3bad28d37024f1d005b
  E08:
    record: sys_script/40afa110c611228401d8643e2c2748cb
    field: script
    how: read Mark Request Closed (before, order 1200)
    result: on a closed request state or stage, makes the request inactive and sets closed by and closed at
    hash: 3975c4a268e4cd2762eb91fcf4d2ef680e296c4127da9ade43b67dd64351c380
  E09:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace › requested item (Work in Progress) › Related records
    how: opened the Related records of a requested item
    result: the tabs Catalog Tasks, Approvers and Group approvals
  E10:
    record: sys_declarative_action_assignment/fe5ba717a33002100c5c9fbca51e6156
    how: read New (sn_sow_req, table sc_task, related list model)
    result: 'shown when the parent item is active (parent.active == true) and the user may create catalog tasks; opens a new catalog task with the related list''s query, so the requested item is filled in'
    hash: cbe4fe6544eb0cd295aa312b698ab6b943eb7f006fb10a88557cb25913f32e3a
  E11:
    record: sys_security_acl/68224ff78c5143100a22deb6dd2b4e4c
    how: read the create ACL on sc_task and its role (sys_security_acl_role 64224ff78c5143100a22deb6dd2b4e4d)
    result: 'role catalog_admin, admin overrides; no other create ACL on sc_task allows it, so itil and sn_request_write can''t create catalog tasks'
    hash: 29b6bc575efda4fe9c3a424846e617c139079396d9a343d76d117139e32bf215
  E12:
    record: sys_script/8c6f35519330220042cf530b547ffb29
    field: script
    how: read Populate parent field in sc_task table, with Auto Populate Request Field (sys_script 3fadac3cc3523000c111113e5bba8f51) and Set Actual Start Time (sys_script bb21a570531320101d8fddeeff7b12c4)
    result: 'on insert the task''s parent becomes the requested item, its request is taken from the item, and an open task gets its actual start time'
    hash: 02ee61b98e525cb8c6a724e864155cec4d3a673e24af722d3a9f9e29d5c2b760
  E13:
    record: sysevent_email_action/03973320c0a801020075d86be149dcbb
    how: read Email assigned to group (sc_task)
    result: '"Catalog Task … has been assigned to group …" to the group when the task has a group and no assignee'
    hash: f823867473c46219c97ee1e5a76f7ed5ab49950a0c0aaea8cb49b8e49a94a5f2
  E14:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    children: sys_hub_action_instance_v2
    how: read the Create Catalog Task steps of Service Catalog item request
    result: 'each step creates one task and waits for that task (wait true); no step looks at other tasks of the item'
    hash: 55678916ab4252c14088760dd6fc8e35fb0b1d42499265535dad4f82911c32a0
  E15:
    record: sys_script/180430660a04bf1500f82aaba735fe7f
    field: script
    how: read Close Tasks Due to Cancellations (sc_req_item, after, when the stage changes to Request Cancelled)
    result: every catalog task whose parent is the item is set to Closed Incomplete
    hash: f2fd0614a23bff4580c59cf427c24d5406cdef18d1012eebc17a61608213cb18
  E16:
    record: sys_ui_action/923920ccc0a8010a0013cceac7f07994
    how: read Copy (global, sc_request) and its roles (sys_ui_action_role bf8971e3c3511200f7d1ca3adfba8fb3, 776931e3c3511200f7d1ca3adfba8f5c)
    result: 'form button (classic and workspace) on saved requests whose items are all active; roles admin and catalog_admin'
    hash: a481a98edf8e0b590cb173477b986fa704533c6e2aa161fb9460387bde7a11f7
  E17:
    record: sys_ui_action/951a0121c3212100c8b837659bba8ffd
    field: client_script_v2
    how: read Copy (global, sc_request), shown when only some items are active; roles admin and catalog_admin (sys_ui_action_role 417931e3c3511200f7d1ca3adfba8fa3, 3aa9b1e3c3511200f7d1ca3adfba8fcc)
    result: 'warns "Some items are inactive and will not be copied", then runs the copy'
    hash: 883b4b295fe097bd4477ab3f7a84ca0927b177f4ce4c12432010452f3c2131b2
  E18:
    record: sys_ui_action/923920ccc0a8010a0013cceac7f07994
    field: script
    how: read what Copy does
    result: 'GlideappScriptHelper.copyRequest, then "Request copied successfully" and the new request opens; a cart error is shown as an error message'
    hash: 5dea46f4629501d222b1aa4f91ad786ce90f230a352f145bd5340fa86857df2d
  E19:
    record: sys_ux_form_action/a7089427c7c230105a06a1e603c2605c
    how: read the workspace Copy form actions (sn_sow_req), with sys_ux_form_action 4d275ce3c7c230105a06a1e603c26069
    result: '"Copy the request and all its related records", and "… skip the copying of requested items having inactive catalog item"'
    hash: c4563e4295200dd1b7feabe593b61e1591ae7de08ce43a0a8f8fe640eb579ffb
---
You manage requests from the Service Operations Workspace: find them, cancel them, add items to
them while they wait for approval, and answer their approvals.

## Find it

{{animation:reqmanage}}

1. In the workspace open **Requests › Open requests** for whole orders, or **Open items** for each
   ordered item. [E01] [E02]
2. Open the request to see its items, state and approvals.

## Cancel

1. Open the request. **Cancel Request** shows in the header (or as a classic form button) while the
   request is pending approval or approved. [E03]
2. Press it. The request becomes *Closed Cancelled*. [E03]

What follows: its flows are canceled with the note *"Due to request cancellation by …"* [E07], its
items' tasks close [E04], and the request becomes inactive with the closing time and who closed
it. [E08]

## Add an item

1. Open the request on the **classic form** while it waits for approval. [E05]
2. Press **Add New Item**. The *Add Catalog Item* window asks the item and the quantity. [E05]
3. Choose them and confirm: the item joins the request.

## Add a catalog task by hand {label=NEW}

{{animation:reqtask}}

The item's flow creates the tasks it needs, one after another. [E14] Add a task by hand only for
extra work the flow doesn't know about, such as a check by another team.

Only catalog administrators (and admins) can do it: **New** needs the right to create catalog
tasks, which `itil` and `sn_request_write` don't give. [E10] [E11] Fulfillers and agents ask a
catalog administrator. [Q04]

1. Open the requested item in the workspace and go to **Related records › Catalog Tasks**. [E09]
2. Press **New**. It shows while the item is active. [E10]
3. A new catalog task opens with the **Requested item** filled in. [E10] Give it a short
   description and an **Assignment group**, and save.

What follows: the task is linked to the item and its request, and its start time is set. [E12]
The group is emailed *"Catalog Task … has been assigned to group …"* while nobody is assigned.
[E13]

How the item's flow treats your task:

| | Your task |
|---|---|
| holds up the flow's next task | no: each flow step waits only for the task it created [E14] |
| holds up the item's completion | no: nothing in the mirror waits for it, so the item can complete while it is still open [E14] [Q18] |
| when the item is cancelled | closed *Closed Incomplete*, with the flow's tasks [E15] |

Close your task before the flow's last task, or the item may be delivered while it is still open.

## Copy a request {label=NEW}

Use it when the same order is needed again, for example for a second person. Only admins and
catalog administrators see **Copy**; service desk agents don't. [E16] [E17] [Q05]

1. Open the request in the workspace or on the classic form. **Copy** is in the header. [E16]
   [E19]
2. Press **Copy**. If some of its items are no longer offered in the catalog, you're warned
   *"Some items are inactive and will not be copied"*. [E17] If none is offered any more,
   **Copy** doesn't show. [E16] [E17]
3. *"Request copied successfully"* shows, and the new request opens. [E18]

The workspace describes it as copying *"the request and all its related records"*, leaving out
items whose catalog item is inactive. [E19] The copy itself is done by the platform, not by a
script you can read [E18]: check the new request's items, quantities and who it is for before it
goes on. [Q17]

## Approvals

IT approvers find request approvals under **Approvals › My approvals**, as for changes (see
[Approve as a technical approver](see:change/review-approval)). [E06]

## Tips

- Look at **Open items** first: **Cancel Request** stops every item in the request, not just one.
  [E03] [E04]
- Write the reason in the request's comments before you cancel, so the requester knows why.
- **Add New Item** only works while the request waits for approval [E05]; after that, the
  requester orders the extra item separately.
- Don't copy a request to change it: copy it when the same order is wanted again, and cancel the
  old one if it is no longer needed. [E03] [E18]
