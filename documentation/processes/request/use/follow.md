---
title: Follow your request
reviewed: 2026-10-17
evidence:
  E01:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › My Requests'
    how: 'opened the page'
    result: 'tabs Submitted requests and Drafts; View Open requests; columns Request, State, Updated'
  E02:
    record: request_filter/581ff221875023000f220cf888cb0bae
    how: read Service Catalog Request Portal
    result: requests you opened or that are for you; opens the order status
    hash: 31a3479a43244d56e30f39e7aed2c88f732e2c781c76c0102dfe3dbc90402fc3
  E03:
    record: ticket_configuration/6752a2a387f10010e0ef0cf888cb0b76
    how: read the requested item ticket configuration
    result: shows the item, requested for, quantity, price, recurring price and stage; no actions
    hash: 7fb4eec1615ed5cff38a0698b98003f6e185522602bb7f98f2734292d60b2721
  E04:
    record: ticket_tab_configuration/1725d9ed87230010e0ef0cf888cb0ba3
    how: read the Additional Details tab
    result: your answers to the item's questions
    hash: 258900b48b1e311de4f4f48b33af8a34ddd0656efd2b03c2481140aa661ba4b8
  E05:
    record: ticket_tab_configuration/fe0f037787750010e0ef0cf888cb0b6a
    how: read the Activity tab
    result: comments with the team
    hash: 3e8507ddea12a590fb6a469b70483c70b2ba2bb8f8aea34eea994f5a7790df24
  E06:
    record: sys_properties/b4b1c18053023300a708ddeeff7b1278
    field: value
    how: read glide.sc.allow_comment_on_closed_ritm
    result: false; no comments on closed items
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E07:
    record: sysevent_in_email_action/1e33e31f0a0a3c74015b770ccb3467c4
    how: read Update Request Item
    result: a reply to an item's email is added to it
    hash: d1183bb7bde9798ac83373312bfca466a612dee3164cdf79c8a7f165255690fe
  E08:
    record: sys_properties/182a3eb60a04bf1501dbef0c06b79cbf
    field: value
    how: read glide.sc.checkout.cancel
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E09:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › My Requests'
    how: 'opened the page'
    result: 'tabs Submitted requests and Drafts; View Open requests or Closed requests; Search open requests'
  E10:
    record: sysevent_email_action/78243e8877323010f088a0e89e5a9969
    field: subject
    how: read Comment left on request
    result: 'Comment added to request ${number}'
    hash: d18ff37f439d6a0d4eadf9db4a64cd6d71d9afab8f5116c9e599208ea2ddf009
---
Once you've ordered, **My Requests** shows where every order is. Open an item to see its stage,
your answers, and the conversation with the team.

## Find it

{{animation:requfollow}}

1. Choose **My Requests** at the top of Employee Center. [E09]
2. **Submitted requests** lists your requests with their state. Switch **View** to *Closed
   requests* to see finished ones, or search them. [E09] [E01] [E02] You see the requests you
   ordered and the ones ordered for you. [E02]
3. **Drafts** holds what you saved for later. [E01]
4. Open an item. You see:

| On the item's page | What it tells you |
|---|---|
| **Stage** | where it is now: approval, fulfilment, delivery [E03] |
| **Price** and **Quantity** | what was ordered, with any yearly cost [E03] |
| **Additional Details** | your answers to the item's questions [E04] |
| **Activity** | the conversation with the team [E05] |

What each state and stage means: [Your request's statuses and emails](see:statuses).

## Add information

- Write in the item's **Activity** tab and send it. [E05]
- Or reply to any email about the item: your reply is added to its Activity. [E07]
- When the team writes to you, you get *"Comment added to request …"* with their message. [E10]

A closed item can't take comments. [E06] If you still need something, order again or report an
incident.

## Cancel

To cancel, open the item and write in its **Activity** tab that you no longer need it, before it's
delivered. [E05] The team then cancels it for you.

### No Cancel button {label=OPEN-QUESTION}

Employee Center offers no **Cancel** on a request or an item [E03] [E08], so employees can only ask
in Activity. IT can cancel with **Cancel Request** (see [Manage a request](see:manage)). Decide
whether employees should cancel themselves before fulfilment starts.

## Tips

- Answer questions from the team quickly: an item waiting for your answer doesn't move.
- Look at the stage before asking: *Backordered*, for example, means it's waiting for stock.

## I want to…

| I want to… | Go to |
|---|---|
| understand a state or an email | [Your request's statuses and emails](see:statuses) |
| order something else | [Find what you need](see:find) |
| report a problem with what I received | [Report an incident](see:incident/report) |
