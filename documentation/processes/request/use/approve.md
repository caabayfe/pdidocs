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
---
## When you're asked

You're asked when someone in your team orders an item that needs a manager's approval, or a
department head's. You get an email *"… needs your approval"*. [E05]

## Approve in Employee Center

{{animation:requappr}}

1. Open **My Tasks**.
2. The order shows as **Approve Request**: the item, who it's for, its price and quantity. [E01]
   [E02]
3. Press **Approve**, or write why and press **Reject**: a rejection needs a reason. [E03] [E04]

## By email

Reply to the approval email with *approve* or *reject* in the subject, and your reason in the
body. [E06]

## What happens next

When approved, the item goes to the next approval or to the fulfilment teams; when rejected, the
request is closed and the requester is told.
