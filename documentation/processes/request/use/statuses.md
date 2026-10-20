---
title: Your request's statuses and emails
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/bc05b6bb8c5503100a22deb6dd2b4ea0
    children: sys_choice
    how: read the request's state choices
    result: Pending Approval, Approved, Closed Complete, Closed Incomplete, Closed Cancelled, Closed Rejected, Closed Skipped
    hash: bd344f3ec8f045eac0e5f041e741b75f5cd7693279a8122c7e4d7f850cd20bce
  E02:
    record: sys_db_object/a805b6bb8c5503100a22deb6dd2b4e26
    children: sys_choice
    how: read the requested item's stage choices
    result: Waiting for Approval, Fulfillment, Delivery
    hash: be5e10b65b3489715a81a2f7a5dc683abbb2e6022831979def13b959d01bdd87
  E03:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read the stages of Service Catalog item request
    result: Manager Approval, Dept. Head Approval, CIO Approval, Order Fulfillment, Backordered, Deployment, Completed, Request Cancelled
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E04:
    record: sys_script/596fac6bc0a8010a00dca5b76857e592
    field: script
    how: read Close Parent if Required
    result: the request closes when all its items are closed
    hash: 1ea7f2d4c1812b85f56e342daf3d9e3ed591fd2725523fa77e94ed49d0160dd3
  E05:
    record: sysevent_email_action/0b4ae8c0b462b410f87755e926c386c2
    how: read Request was opened and its message
    result: 'subject "Request ${number} was created"; "We received your request", the REQ number and a View request button'
    hash: 8f6ee67bc42176de4e606a13ee5cd36ece48c9c0dd2e96791d786a31ab33a0d7
  E06:
    record: sysevent_email_action/d0e27780b4b27050f87755e926c38683
    how: read Request approved and its message
    result: 'subject "Request ${number} was approved"; says it was approved and will proceed, with the approver''s notes if any'
    hash: 324a106b895b58ea8006c0a2de9e60dabc4f1d187347a93d6da5759d1cae46d6
  E07:
    record: sysevent_email_action/2bf1538377223010f088a0e89e5a99fb
    how: read Request Rejected and its message
    result: 'subject "${number} was Rejected"; says the request was rejected and will be closed'
    hash: 234796e84ec819b04c11f149e1242870ac2a43a318c572eaa852fc14481c1627
  E08:
    record: sysevent_email_action/704d4cc4c611227d00f60f20d0758ddf
    how: read Request Item Delivery
    result: 'when an item reaches the Delivery stage, to the person it is for: "Your requested ${task_effective_number} for ${cat_item} is being delivered"'
    hash: 72cb2b2b81c186508eda8d8136eb754fc604adb07ce099015fc425a6410122b5
  E09:
    record: sysevent_email_action/78243e8877323010f088a0e89e5a9969
    field: subject
    how: read Comment left on request
    result: 'Comment added to request ${number}'
    hash: d18ff37f439d6a0d4eadf9db4a64cd6d71d9afab8f5116c9e599208ea2ddf009
  E10:
    record: sysevent_email_action/a3360ac0672630105f74e8a331b73019
    how: read Request completed and its message
    result: 'subject "Request ${number} was completed"; says it was marked complete, who completed it, the completion notes and its items'
    hash: 2a3e5c60c70aafff32b277421b8fcabfdad929c3b7100e4ecb9bed4b757f4a16
  E11:
    record: sys_notification/556e06627f7d121073b72458bc86657d
    how: read the portal notifications
    result: opened, approved, rejected, completed and item comments also appear under the bell, for the requester and the person it is for
    hash: e37169c61955afb23b66d8a3438077895b39d605274c49991bd174f04ccb7ca1
  E14:
    record: ticket_configuration/6752a2a387f10010e0ef0cf888cb0b76
    how: read the requested item ticket configuration
    result: the item page shows the item, requested for, quantity, price, recurring price and stage
    hash: 7fb4eec1615ed5cff38a0698b98003f6e185522602bb7f98f2734292d60b2721
  E15:
    record: sys_hub_flow/d4a0864e87232300bdcf480688cb0bb1
    how: read Requested Item Manager Approval, the first stage of Service Catalog item request (36 items)
    result: asks requested_for.manager, the manager of the person the item is for
    hash: 768ecdceeff520a77ca8ee1a4636521fe7c5bad41a0bc8bff7e33bfee2a130dd
---
Every order has two levels. The **request** (REQ…) is your order as a whole, and it has a
**state**. Each thing you ordered (RITM…) is listed in it, and each has a **stage** that
shows where it is on its way to you. You see the state in **My Requests** and the stage when you
open an item. [E14]

{{animation:reqstatus}}

## The request's state

| State | What it means for you | What to do |
|---|---|---|
| **Pending Approval** | someone has to approve it first | nothing; you get an email when they decide |
| **Approved** | it's approved and the teams are working on it | wait for delivery; answer questions in Activity |
| **Closed Complete** | everything was delivered | check you have it |
| **Closed Incomplete** | it was closed without being finished | read the Activity to see why |
| **Closed Cancelled** | it was canceled | order again if you still need it |
| **Closed Rejected** | an approver said no | read the reason in the email; ask the approver if it isn't clear |

[E01] The request closes by itself when all its items are closed. [E04]

## Each item's stage

The stages depend on the item. A laptop, for example, goes through: [E03]

1. **Manager Approval**, then **Dept. Head Approval** (and **CIO Approval** for some items)
2. **Order Fulfillment**: it's being bought or prepared; **Backordered** if it's out of stock
3. **Deployment**: it's being set up and brought to you
4. **Completed**

Simpler items show **Waiting for Approval**, **Fulfillment** and **Delivery**. [E02]

## The emails you get

| When | Subject | What it says |
|---|---|---|
| you order | *Request REQ… was created* | that it was received, with a **View request** button [E05] |
| it's approved | *Request REQ… was approved* | that it will proceed, with the approver's notes [E06] |
| it's rejected | *REQ… was Rejected* | that it will be closed [E07] |
| the team writes to you | *Comment added to request …* | their message; reply to answer [E09] |
| an item is on its way | *Your requested RITM… for … is being delivered* | sent to the person it's for [E08] |
| it's complete | *Request REQ… was completed* | who completed it, their notes and the items [E10] [Q11] |

The same updates appear under the **bell** in Employee Center. [E11]

## Tips

- Only a number in the email? Its **View request** button opens it in Employee Center.
- Waiting long for approval? Most devices and access items are approved first by the manager of
  the person they're for [E15]: ask them.
- To add information, reply to the email or write in the item's **Activity**: see [Follow your
  request](see:follow).

## I want to…

| I want to… | Go to |
|---|---|
| see my request and add information | [Follow your request](see:follow) |
| know who approves it | [Who approves](see:approvals) |
| order something else | [Find what you need](see:find) |
