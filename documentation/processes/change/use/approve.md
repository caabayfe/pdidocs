---
title: Approve a change
reviewed: 2026-10-17
evidence:
  E01:
    record: sn_ex_sp_activity_configuration/6bb13398c31930105a09f0ad9840dd8e
    how: read the Employee Center activity Tasks
    result: opens My tasks (hrm_todos_page)
    hash: f5f81fb48b524e1fca784f07f63859b766a0e1bc36b12f15330808d151142da7
  E02:
    record: sn_hr_sp_todos_config/23fb71a8731023002ceb31d7caf6a7b6
    how: read the to-do configuration Approvals
    result: 'title "Approve Request"; approvals requested from you or your delegations'
    hash: 5e59975037e055760e8b3260b8199302a693b5c3914ea1f5e7bd6ae6e1ade4d9
  E03:
    record: sp_widget/34a149f0531130107eb7ddeeff7b1271
    field: template
    how: read Todos Approval Actions
    result: 'comments box "If you are rejecting the request, provide the reason here."; Approve and Reject; "Reject Request" asks for a reason'
    hash: c635984c31130d7be31839e112598e0c600b376b3b8a23c04a68fc7690a6d467
  E04:
    record: sysevent_email_action/aea24ac2c611227101fe910c323fb00e
    how: read Approval Request
    result: email with "Click here to approve" and "Click here to reject" links
    hash: 6f535a07b72cecda86b48a1bcad2744f1ec80b97b682728563cd338bc646927b
  E05:
    record: sysevent_in_email_action/b43ef438c611227100a9aa83fe121dda
    field: script
    how: read Update Approval Request
    result: a reply from the approver with approve or reject in the subject decides; the body is saved as a comment
    hash: e0cd4afae7104bafe04a27e16d4f4992a5ec28c7604f1773498fc99e4ea2f901
  E06:
    record: sys_security_acl/1cbf65965f011000b12e3572f2b4776e
    field: script
    how: read the change read ACL for approvers
    result: approvers can open the change from their approval
    hash: 204381808f784893770069b34e35fa66a9687e9cbccd9f405a46dc407dac40eb
  E07:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center header'
    how: 'read the header links'
    result: 'My Tasks, My Requests, My Favorites'
---
## When you're asked

You get an email: *"Change Request CHG… Approval Request"*, with what the change is, when it
happens and its risk. [E04] You're usually asked as the manager of the team doing the change, or
as a member of the change advisory board.

## Approve in Employee Center

1. Open **My Tasks** at the top of Employee Center. [E07] [E01]
2. The change shows as **Approve Request**, with its number and summary. [E02] You can open it
   to read the plan. [E06]
3. Press **Approve**, or write why in the comments box and press **Reject**: a rejection needs a
   reason. [E03]

## Approve by email

Use the **Click here to approve** or **Click here to reject** link in the email. It opens a reply
with *approve* or *reject* in the subject; add your reason in the body and send it. [E04] [E05]
Only replies from you count, and your text is kept as a comment on the approval. [E05]

## What to look for

- Does the plan say what will be done, how it will be tested and how it will be undone?
- Is the window right for your team, and are the people affected told?
- If you're unsure, reject with a question: the change comes back to be improved.
