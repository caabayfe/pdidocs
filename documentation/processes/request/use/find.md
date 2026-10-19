---
title: Find what you need
reviewed: 2026-10-17
evidence:
  E01:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center search, "laptop"'
    how: 'searched'
    result: 'Developer Laptop (Mac) $1,499.00 + $100.00 Annually, Standard Laptop $1,100.00 + $100.00 Annually, Loaner Laptop, Sales Laptop, Development Laptop (PC) $1,000.00, sleeves and adapters, Install Software, and articles'
  E02:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Technology services › Hardware › Computers'
    how: 'opened the topic'
    result: 'Support resources with Filter by All, Articles, Requests and Sort by Popular, A-Z; requests show their price'
  E03:
    record: sc_category/d258b953c611227a0146101fb1be7c31
    how: read the catalog category Hardware and its children
    result: Cables and Adapters, Desktops, Laptops, Mobiles, Printers, Tablets
    hash: ed82af418222de801892245761b4a68187690f4bd8eac5ca17ddbba4920a635f
  E04:
    record: sc_category/2809952237b1300054b6a3549dbe5dd4
    how: read the category Software and its children
    result: software such as Acrobat and Snagit, and Application and Account Access (DocuSign, AWS account)
    hash: ca8711ffcd3a5a32a0a1d3bb7ad169cb3faca5208db5b50c7cb549103339ea0b
  E05:
    record: sc_category/109cdff8c6112276003b17991a09ad65
    how: read the category Office
    result: Telephone Extension, Paper and Supplies, and its Services (Provision a Database, Request for Backup)
    hash: 74aa8ca40e8baab712a914c71257ce0ad944874ee7126a0816e36a33e9d6575f
  E06:
    record: sc_category/2c0b59874f7b4200086eeed18110c71f
    how: read the category Peripherals
    result: monitors, keyboards and mice, such as Standard 24" Monitor and Wireless keyboard and mouse
    hash: db194e4f8c5b485bf48b473adcea75920c8aee680d22c8a3ddb39c687b70a7e3
  E07:
    record: sc_cat_item_guide/6690750f4f7b4200086eeed18110c761
    how: read the order guide New Hire, its questions and rules
    result: asks the hiring manager, the group, remote or not, office, device and mobile type; always adds New Email Account and Corp VPN, adds Desk Set Up when not remote, a laptop and monitor by device type, and a phone by mobile type
    hash: f361918c885dca584c37b909af5a01e28e490bd9adfb93f3b680561c84b5fd19
  E08:
    record: sc_cat_item_guide/25110912372211003e7d40ed9dbe5dd6
    how: read Request Developer Project Equipment
    result: 'asks "Android or iOS?" and "What software do you require?"; in no category, found by search'
    hash: 8ecda4d0c2639db2c7a8e2820914039c5873418e6e5a959d2eb9bdd51380686b
  E09:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read Create Incident
    result: creates an incident, not a request; opens it when you submit
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E10:
    record: sc_cat_item_producer/38c1fc840a0a0b2700285921c2bf5fc8
    how: read Report Outage (and Report Performance Problem 382676790a0a0b27003223f15c84b1d2, Password Reset 29a39e830a0a0b27007d1e200ad52253)
    result: each creates an incident in Can We Help You?
    hash: 5448af60b7251fec431e98abbac90029b4397a330eceb19c570244a907eaaeac
  E11:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Employee Center › Standard Laptop'
    how: 'opened the item page'
    result: 'Quantity, Price $1,100.00 + $100.00 Annually, Delivery Time 9 Days, Save as Draft, Order Now; questions Optional Software, Additional software requirements'
  E12:
    record: sys_hub_flow/011c5d579fd11210db9f618dfa0a1ce1
    how: read the subflow Request Management Approval
    result: 'condition "Price > $1,000?" on the request''s price (a currency input): over $1,000 asks a group for approval; otherwise approved automatically'
    hash: 6a2bf9df5bcde4821796803bc625bda2c55f7525b2e10a234388f121d60262e4
  E13:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center home page'
    how: 'read the Quick links'
    result: 'System status and Request Standing Desk'
  E14:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Request DocuSign access'
    how: 'opened the item page, submitted nothing'
    result: '"* Indicates required"; Requested for filled with the employee; Business justification required; a Required information box beside Save as Draft and Submit lists Business justification'
  E15:
    record: sys_hub_flow/30f3d26187e92300e0ef0cf888cb0b91
    how: read the flow Service Catalog item request (used by 36 items, among them the laptops, phones and access items)
    result: stages Manager Approval, Dept. Head Approval, then fulfilment
    hash: 7e4c924ae8f9da3ea0457d090b77e53a58e495b1cc6bbb64ef9f043b7d32201b
  E16:
    record: sys_hub_flow/d4a0864e87232300bdcf480688cb0bb1
    how: read Requested Item Manager Approval
    result: asks requested_for.manager, the manager of the person the item is for
    hash: 768ecdceeff520a77ca8ee1a4636521fe7c5bad41a0bc8bff7e33bfee2a130dd
  E17:
    record: sys_hub_flow/d8a9420287632300bdcf480688cb0bef
    how: read Requested Item Dept Head Approval
    result: asks requested_for.department.dept_head
    hash: 7725f09a82b08ab534279fd3c2159d7893fd0e33d11f023ff21cddfa9ca796de
  E18:
    record: sc_cat_item_user_criteria_mtom/ff642d5c7361230039517a5454f6a790
    how: read who the Password Reset form is available for
    result: Users with 'cmdb_read' Role only, a role IT staff have and employees don't
    hash: 1e50b259aaa2a5e81dfd9de365ba49a6a7a990c79b38f0a0f3820d540f201086
---
The **catalog** is the list of everything IT can give you: devices, software, access and
services. Each thing you can order is an **item**, with its own page, price and questions. You
find items in three ways: search, browse by topic, or start from a bundle that orders several
at once.

{{animation:reqfind}}

## Is it a request or a problem?

| You… | It's a… | Use |
|---|---|---|
| need something you don't have yet: a laptop, software, access | **request** | an item from the catalog (this page) |
| have something that worked and now doesn't | **incident** | [Report an incident](see:incident/report) |

Some forms in the catalog report problems rather than order things: **Create Incident**, **Report
Outage**, **Report Performance Problem** and **Password Reset**. They create an incident, which
you follow the same way. [E09] [E10] Only IT staff see **Password Reset** [E18]; to reset your own
password, see [Reset or change your password](see:getting-help/password).

## Search

Type the thing you need in the search box at the top: *laptop*, *monitor*, *VPN*, *Adobe*. The
results show items with their price, and help articles. Choose **Catalogs** on the left to see
only items. [E01] Search is the quickest way when you know roughly what it's called.

## Browse by topic

Open **Help center › Technology services**, then a subtopic such as **Hardware**, then
**Computers**. Set **Filter by** to *Requests* to see only what you can order, and **Sort by** to
*A-Z*. [E02] The popular topics on the home page (Computers, Software, Accessories…) are shortcuts
to the same pages.

## What you can ask for

A sample of what pdi2's catalog holds, so you know where to look:

| Kind | For example | Where |
|---|---|---|
| Computers and phones | Standard Laptop, Developer Laptop (Mac), Apple iPhone 13, Pixel 4a | Hardware [E03] |
| Screens and accessories | Standard 24" Monitor, Wireless keyboard and mouse, Multiport AV adapter | Peripherals, Hardware › Cables and Adapters [E06] [E03] |
| Software | Acrobat, Snagit, a *Non-standard software request* | Software [E04] |
| Access to applications | Request DocuSign access, AWS account request | Software › Application and Account Access [E04] |
| Office | Telephone Extension, Paper and Supplies, a Standing Desk (quick link) | Office, home page [E05] [E13] |
| IT services | Provision a Database, Request for Backup | Office › Services [E05] |

If nothing fits, search for *non-standard* or ask in the chat.

## Bundles: order several things at once

A **bundle** asks a few questions and then orders the right set of items for you in one go
(see [Order something](see:order) for how ordering works).

- **New Hire**: for a manager preparing for someone who joins. It asks the hiring manager, the
  team, whether they work remotely, the office, and the device and phone type. It always adds an
  email account and VPN access, a desk when they aren't remote, and the laptop, monitor and phone
  that fit. [E07]
- **Request Developer Project Equipment**: hardware and software for a development project. It
  asks *"Android or iOS?"* and *"What software do you require?"*. It isn't in a topic: find it by
  search. [E08]

## Before you order

On an item's page, check its **Price**, its **Delivery Time** and its questions [E11] [E14]; [Order
something](see:order) walks you through it.

Who has to say yes depends on the item and the total:

- a request worth more than **$1,000** in total needs one more approval; below that it's approved
  automatically [E12];
- most devices and access items are approved by the **manager of the person it's for**, then by
  that person's **department head**. [E15] [E16] [E17]

## Tips

- Mark items you order often with the heart, to find them in **My favorites**.
- Ordering for a new colleague? Use **New Hire** instead of ordering each item.

## I want to…

| I want to… | Go to |
|---|---|
| order the item I found | [Order something](see:order) |
| know who approves it | [Who approves](see:approvals) |
| report a problem instead | [Report an incident](see:incident/report) |
