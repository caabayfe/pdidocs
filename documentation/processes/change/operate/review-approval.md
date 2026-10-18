---
title: Approve as a technical approver
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ux_list/a91ea05b9351121004e40b2764891806
    how: read the workspace list My approvals
    result: approvals for you or your delegations, for changes, requests and catalog tasks; no state filter
    hash: fc69db4d74ecb8b75d2f83e659d7192eead58821ddf0bd3375297539ac46e4c4
  E02:
    record: sys_declarative_action_assignment/6e1d226f93b9121004e40b27648918b0
    how: read Approve (workspace)
    result: on a requested approval that is yours
    hash: 8d82475d2ec30e37dde55a63e530343c926e85eb6efc249ca729dfe1ff6a72b6
  E03:
    record: sys_declarative_action_assignment/49ce66ef93b9121004e40b27648918a4
    field: server_script
    how: read Reject (workspace)
    result: 'on a requested approval that is yours or as approval_admin; without a comment, "Comments are required when rejecting an approval"'
    hash: b0f58a96d87bfb9486cd3bdd8c8ac56c245b6a71d56e1ad42de34cb7f668c928
  E04:
    record: sys_ui_action/8468ee55c611227d01a072a67bdbd3e7
    how: read Approve (classic approval form)
    result: for the approver or a delegate
    hash: 262f6576358ee0289d3d960680ac2a50b0bfa1b63e7fc66ebe0acdf1c3c3acd4
  E05:
    record: sys_ui_action/846c5fcbc611227d00993730e69626fe
    field: script
    how: read Reject (classic approval form)
    result: '"Comments are required when rejecting an approval"'
    hash: 3cbfa219ad1ce949157833580c20fdc8698e0632c9f64d20ee09f1dd4e302fb4
  E06:
    record: sys_ui_policy/8bc580335f132000a9ad2572f2b4775a
    how: read Comments mandatory on rejection
    result: comments required on a rejected approval
    hash: 235e7ae27026a3725d3ba5367ba3584ceb3afdf97a740f7c8df8c232a5931fc3
  E07:
    record: sysevent_email_action/ae127113c611227101038b7890391e0a
    how: read Change approved
    result: to the assignee
    hash: 28772b5b95470ac9f41d9de8c817d35e5ad71830707dc63c4941106dffceb7ee
  E08:
    record: sysevent_email_action/ae14a7d9c611227100f0761a07f7be54
    how: read Change rejected
    result: to the assignee
    hash: 412a97d17de7db197919c0c12d6b95f097420fca1288c0d2b0cc9715dcebd31e
  E09:
    record: sysevent_email_template/adfe0cadc611227100ffab0a08978ef2
    how: read change.itil.approve.role, the template of Approval Request
    result: 'subject "${sysapproval.sys_class_name} ${sysapproval} Approval Request"; links to view the approval and the change'
    hash: ab8067ccffb76acef2c2a187d51331ad1dd6fda0a0ffcb978ee259a1bab986f8
  E10:
    record: sys_script/318cdc50d7302200d105ef637e610366
    how: read Sync approval with agenda item
    result: when the change's approval becomes approved or rejected, its CAB agenda item follows
    hash: 4b4df9e7f17d9fef9f8e95e7766954e6fe8f221de09b7b5c903e24a3cf0f028f
---
You're asked to approve a change as a member of the team doing it (in *Assess*), as its manager,
or as a member of the CAB Approval group (in *Authorize*). This page shows where to answer and
what follows. See [Who approves](see:approvals).

## In the workspace

{{animation:chgappr}}

1. Open **Approvals › My approvals** in the Service Operations Workspace. [E01] The list shows
   approvals for changes, requests and catalog tasks, yours and your delegations'.
2. Filter or sort by **State**: the list has no state filter, so answered approvals show too.
   [E01]
3. Open the approval and read the change it is for.
4. Press **Approve**. [E02] Or write a comment and press **Reject**; without a comment the
   workspace answers *"Comments are required when rejecting an approval"*. [E03]

## On the classic form

1. Open the approval from the email's *Click here to view Approval Request* link [E09], or from
   **Self-Service › My Approvals**.
2. Press **Approve** or **Reject**: the buttons show only on a requested approval that is yours or
   delegated to you. [E04]
3. To reject, fill **Comments** first: it becomes mandatory when the state is *Rejected* [E06],
   and the button refuses with *"Comments are required when rejecting an approval"*. [E05]

## What happens next

| You | What follows |
|---|---|
| Approve | when the approvals it needs are in, the change moves on; its assignee gets the *Change approved* email [E07] |
| Reject | the assignee gets the *Change rejected* email [E08]; the change comes back to be fixed |

If the change is on a CAB meeting's agenda, its agenda item follows your answer. [E10]

## What to check

The implementation, test and backout plans, the window, the affected services and the risk. If
something is missing, reject with the question: the requester fixes it and asks again.

## Tips

- When you reject, write the question you need answered: that is what the requester fixes.
- Prefer the workspace to an email reply: it shows the change's plans before you decide.
- Approvals for requests and catalog tasks appear in the same list (see
  [Manage a request](see:request/manage)). [E01]
