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
    how: read Reject (workspace)
    result: on a requested approval that is yours
    hash: 7fdcece48db85d0bbba07777a7ff0691e87d13b6baa0c82639a081f992eef0e4
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
---
## In the workspace

{{animation:chgappr}}

Open **Approvals › My approvals**. [E01] The list has no state filter, so earlier approvals show
too: sort or filter by state. Open one, read the change, and press **Approve** or **Reject**. [E02]
[E03]

## On the classic form

Open the approval from your email or from **Self-Service › My Approvals**, then **Approve** or
**Reject**. [E04] A rejection needs a comment saying why. [E05] [E06]

## What to check

The implementation, test and backout plans, the window, the affected services and the risk. If
something is missing, reject with the question: the requester fixes it and asks again.
