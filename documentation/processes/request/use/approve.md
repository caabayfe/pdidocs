---
title: Approve a request
reviewed: 2026-10-17
evidence:
  E01:
    record: sn_hr_sp_todos_config/23fb71a8731023002ceb31d7caf6a7b6
    how: read the to-do configuration Approvals
    result: '"Approve Request" cards for approvals requested from you or delegated to you'
    hash: 5e59975037e055760e8b3260b8199302a693b5c3914ea1f5e7bd6ae6e1ade4d9
  E02:
    record: sn_ex_sp_todo_config_detail/55ea779cc31930105a09f0ad9840dd46
    how: read the requested item approval card
    result: the item's name, who it is for, price and quantity
    hash: e706a11ce81505b10724d580c2137611360125ffb42c2de0dfc18a450da9219b
  E03:
    record: sp_widget/34a149f0531130107eb7ddeeff7b1271
    field: template
    how: read Todos Approval Actions
    result: 'Approve, Reject, comments box; "Reject Request" asks for a reason'
    hash: c635984c31130d7be31839e112598e0c600b376b3b8a23c04a68fc7690a6d467
  E04:
    record: sys_script_include/d204a315ebdcbd507f419f67135228de
    field: script
    how: read TodoApprovalActionsUtilSNC
    result: a rejection needs a reason when you can comment on the record
    hash: ba3314e92c0f1e2e1b62cb55cd37597de9152f8df0b02b3acaca37bc512c5909
  E05:
    record: sysevent_email_action/bb32008477623010f088a0e89e5a9945
    how: read Request approval assigned
    result: '"… needs your approval"'
    hash: 76c55041050ceb1b900ef27b755c8f8f52f8abc7754d533ae6131cffc3376013
  E06:
    record: sysevent_in_email_action/b43ef438c611227100a9aa83fe121dda
    field: script
    how: read Update Approval Request
    result: a reply from you with approve or reject in the subject decides
    hash: e0cd4afae7104bafe04a27e16d4f4992a5ec28c7604f1773498fc99e4ea2f901
  E07:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › My Tasks'
    how: 'opened the page'
    result: 'Open and Completed; "You don''t have any tasks right now."'
  E08:
    record: sn_hr_sp_todos_config/a9f7af0f238f23007e45ff5e17bf65d3
    how: read the to-do configuration for completed approvals
    result: approvals you already answered are kept under Completed
    hash: b4fffbfa583637946145c8ac80f794c3fa939d55f9c62fc58a20d1c2be734b48
  E09:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read the stages of Service Catalog item request (36 items)
    result: Manager Approval, Dept. Head Approval, CIO Approval, Order Fulfillment, Backordered, Deployment, Completed, Request Cancelled; a rejection by the manager or department head ends the item
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E10:
    record: sys_hub_flow/d4a0864e87232300bdcf480688cb0bb1
    how: read Requested Item Manager Approval
    result: asks requested_for.manager
    hash: 768ecdceeff520a77ca8ee1a4636521fe7c5bad41a0bc8bff7e33bfee2a130dd
  E11:
    record: sys_hub_flow/d8a9420287632300bdcf480688cb0bef
    how: read Requested Item Dept Head Approval
    result: asks requested_for.department.dept_head
    hash: 7725f09a82b08ab534279fd3c2159d7893fd0e33d11f023ff21cddfa9ca796de
  E12:
    record: sys_script/aea34678c61122710151b1b7fdf65762
    field: script
    how: read Approval Events (Task)
    result: an approval on a request fires request.approval.inserted; on anything else, such as an ordered item, approval.inserted
    hash: 9e9a4ec81320c89f60e5c2f023ebc294df6e31f00149483a5011336c1f3b961e
  E13:
    record: sysevent_email_template/adfe0cadc611227100ffab0a08978ef2
    how: read change.itil.approve.role, the template of Approval Request (approval.inserted)
    result: 'subject "${sysapproval.sys_class_name} ${sysapproval} Approval Request", with approve and reject links'
    hash: ab8067ccffb76acef2c2a187d51331ad1dd6fda0a0ffcb978ee259a1bab986f8
---
When an item is ordered for someone you manage, or for someone in the department you head, and
the item needs approval, it waits for you. [E10] [E11] Your answer decides whether it goes to the teams who deliver it.

## When you're asked

You get an email, and the approval appears in **My Tasks** in Employee Center. [E01] The subject
says what waits for you [E12]:

- *"Requested Item RITM… Approval Request"*: one item, which you approve as the manager or
  department head [E13];
- *"Request REQ… needs your approval"*: a whole order worth more than $1,000. [E05]

## Approve in Employee Center

{{animation:requappr}}

1. Open **My Tasks** at the top of Employee Center. **Open** lists what waits for you. [E07]
2. Each order shows as **Approve Request**, with the item, who it's for, its price and quantity.
   [E01] [E02]
3. Decide:

| You press | What you must give | What happens |
|---|---|---|
| **Approve** | nothing | the item goes to the next approval (the department head after the manager), then to the teams who deliver it [E09] |
| **Reject** | a reason in the comments box [E03] [E04] | the item stops and is closed [E09] |

Your answered approvals stay under **Completed**. [E08]

## By email

Reply to the approval email with *approve* or *reject* in the subject, and your reason in the
body. [E06] Only your own reply counts.

## What to check before you approve

- Is it needed for the work, and is the price right for it?
- Is it for the right person? Look at who it's for, not only who ordered.
- Is the quantity right?

If you're unsure, reject with your question as the reason: the requester can order again with
the answer.

## I want to…

| I want to… | Go to |
|---|---|
| know when I'm asked to approve | [Who approves](see:approvals) |
| approve a change instead | [Approve a change](see:change/approve) |
