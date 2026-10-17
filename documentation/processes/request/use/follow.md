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
---
## Find it

Open **My Requests**: **Submitted requests** lists your requests with their state; switch **View**
to see closed ones. [E01] [E02] **Drafts** holds what you saved for later. [E01]

Open an item to see its **stage**, the price and quantity [E03], your answers under **Additional
Details** [E04], and the **Activity** with the team. [E05]

## Add information

Write in the **Activity** tab, or reply to an email about the item. [E05] [E07] A closed item
can't take comments. [E06]

## Cancel {label=OPEN-QUESTION}

Employee Center offers no **Cancel** on a request or item. [E03] [E08] To cancel, ask the service
desk on the item's Activity tab, before it is delivered.
