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
  E08:
    record: sysevent_email_template/adfe0cadc611227100ffab0a08978ef2
    how: read change.itil.approve.role, the template of Approval Request
    result: 'subject "${sysapproval.sys_class_name} ${sysapproval} Approval Request"; Short Description, Priority, Category, a change summary, the description as Comments, approve and reject links, Approval Activity, links to the approval and the change'
    hash: ab8067ccffb76acef2c2a187d51331ad1dd6fda0a0ffcb978ee259a1bab986f8
  E09:
    record: sys_decision_question/a436029db701230034d1da23ee11a989
    how: read Assess Technical Approvals (Normal Change Policy)
    result: in Assess, the technical approval
    hash: 8231467b8500725eba2e0ac3a931edcf2395bb0aa7fcd49ee6717b9bb0a41d82
  E10:
    record: sys_decision_question/88e6829db701230034d1da23ee11a9a9
    how: read Low Risk Manager approval
    result: in Authorize with low risk, the assignment group's manager, unless already approved
    hash: a3d6cc567aa1646374434af0e474e9964cb34cccd39a6e3feeef03c776a3db22
  E11:
    record: sys_decision_question/10284a9db701230034d1da23ee11a9c1
    how: read Requires CAB Approval (Normal)
    result: in Authorize with moderate, high or no risk, or a group without a manager, the CAB
    hash: 218626518664d74e741d7f64a8d163ed7e6136a2800d25f69c113cd1d4367ab9
  E12:
    record: sysevent_email_action/ae127113c611227101038b7890391e0a
    how: read Change approved
    result: to the assignee
    hash: 28772b5b95470ac9f41d9de8c817d35e5ad71830707dc63c4941106dffceb7ee
  E13:
    record: sysevent_email_action/ae14a7d9c611227100f0761a07f7be54
    how: read Change rejected
    result: to the assignee
    hash: 412a97d17de7db197919c0c12d6b95f097420fca1288c0d2b0cc9715dcebd31e
  E14:
    record: sn_hr_sp_todos_config/a9f7af0f238f23007e45ff5e17bf65d3
    how: read the to-do configuration for completed approvals
    result: approvals you already answered are kept under Completed
    hash: b4fffbfa583637946145c8ac80f794c3fa939d55f9c62fc58a20d1c2be734b48
  E07:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center header'
    how: 'read the header links'
    result: 'My Tasks, My Requests, My Favorites'
---
Some changes to IT services need your yes before they go ahead. When you're asked, read what
will be done and when, then approve or reject it from Employee Center or from the email.

## When you're asked

You're asked in one of three roles [E09] [E10] [E11]:

- as a **member of the team doing the change**, to check it technically;
- as **that team's manager**, for a low-risk change;
- as a member of the **change advisory board (CAB)**, the group that approves riskier and urgent
  changes.

You get an email with the subject *"Change Request CHG… Approval Request"*. It shows the change's
short description, priority and category, its description, and **Click here to approve** and
**Click here to reject** links. [E08] [E04] Approvals for things people order look different: their
subject starts with *Request* or *Requested Item*, not *Change Request*.

## Approve in Employee Center

{{animation:chguappr}}

1. Open **My Tasks** at the top of Employee Center. [E07] [E01]
2. The change shows as **Approve Request**, with its number and summary. [E02] You can open it
   to read the plan. [E06]
3. Press **Approve**, or write why in the comments box and press **Reject**: a rejection needs a
   reason. [E03]

Your answered approvals stay under **Completed**. [E14]

## Approve by email

Use the **Click here to approve** or **Click here to reject** link in the email. It opens a reply
with *approve* or *reject* in the subject; add your reason in the body and send it. [E04] [E05]
Only replies from you count, and your text is kept as a comment on the approval. [E05]

## What happens next

| You | What happens |
|---|---|
| **Approve** | the change can move on to its next step; the person working on it is told by email that it was approved [E12] |
| **Reject** | the person working on it is told by email that it was rejected [E13]; the change comes back to be improved |

## What to look for

- Does the plan say what will be done, how it will be tested and how it will be undone?
- Is the window right for your team, and are the people affected told?
- If you're unsure, reject with a question: the change comes back to be improved.

## Tips

- The email doesn't show when the change happens [E08]: open the change from **My Tasks** to see when it happens.
- Answer before the planned start: a change waiting for you can't go ahead.

## I want to…

| I want to… | Go to |
|---|---|
| know who approves which change | [Who approves](see:approvals) |
| see what a change goes through | [The life of a change](see:lifecycle) |
| approve something someone ordered | [Approve a request](see:request/approve) |
