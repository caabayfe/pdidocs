---
title: Using Employee Center
reviewed: 2026-10-17
evidence:
  E01:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center home page'
    how: 'opened /esc as an employee'
    result: 'header: Search, My Tasks, My Requests, My Favorites, notifications bell, profile menu, Tours; left bar: Home, Help center, Get support; chat button at the bottom right'
  E02:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center home page'
    how: 'read the home page'
    result: 'Quick links System status and Request Standing Desk; Popular topics Email accounts, Software issues, Accessories, Computers, Software, Developer services, Technology services, Phone and mobility; Recommended for you (articles); My active items Tasks, Requests, Surveys; My favorites'
  E03:
    record: sp_page/0987d9aa53331210b8f2ddeeff7b129d
    how: read the home page layout
    result: search, then Quick Links, Popular Topics and Recommended for you on the left, My Items and Favorites on the right
    hash: 1b1900684bb653645d7f6307ed310d71bf3b8948dcbc2829e5ffdb696c9ad580
  E04:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Help center › Technology services'
    how: 'opened the topic'
    result: 'subtopics Hardware, Software, Network, Privacy and security, IT for IT, Developer services; Support resources filtered by All, Articles or Requests, sorted Popular or A-Z; quick links Printer issues, System status'
  E05:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Technology services › Hardware › Computers'
    how: 'opened the Computers popular topic'
    result: 'breadcrumb Home › Technology services › Hardware › Computers; articles and requests together, each request with its price'
  E06:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center search, "laptop"'
    how: 'searched'
    result: 'sources All, Knowledge Bases, Catalogs; filters by topic; items with their price (Standard Laptop $1,100.00 + $100.00 Annually) and articles with their KB number'
  E07:
    record: ais_search_profile/fd6491cb53171010069addeeff7b123f
    how: read the Employee Center search profile
    result: searches the catalogs and the knowledge bases
    hash: 85fcb68cc2ae8f99bb9c5eb4e00d229d08f25e29f40e98042a4a1d836c244552
  E08:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › My Requests'
    how: 'opened the page'
    result: 'tabs Submitted requests and Drafts; View Open requests or Closed requests; a search box'
  E09:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › My Tasks'
    how: 'opened the page'
    result: 'Open and Completed; "You don''t have any tasks right now."'
  E10:
    record: sn_hr_sp_todos_config/23fb71a8731023002ceb31d7caf6a7b6
    how: read the to-do configuration Approvals
    result: approvals asked of you appear in My Tasks
    hash: 5e59975037e055760e8b3260b8199302a693b5c3914ea1f5e7bd6ae6e1ade4d9
  E11:
    record: sn_ex_sp_notifs_portal_notification_config/69a7295377701210f1d7756f1b5a99f6
    how: read the notifications configuration
    result: the bell shows a count; each notification can be marked as read, kept as a reminder or cleared; Mark all as read
    hash: cfe8465b99c4332bfcb06fb8769e0d52ed907646d14915e86403c2e934416a63
  E12:
    record: sys_notification/556e06627f7d121073b72458bc86657d
    how: read the portal notifications
    result: your request opened, approved, rejected and completed, and comments on your items, also appear under the bell
    hash: e37169c61955afb23b66d8a3438077895b39d605274c49991bd174f04ccb7ca1
  E13:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › profile menu'
    how: 'opened the menu'
    result: 'Profile and Logout (Impersonate entries show only because an administrator signed in)'
  E14:
    seen:
      by: 'Claude (snagentic session, impersonating Abel Tuter)'
      on: 2026-10-17
      where: 'Employee Center › Get support'
    how: 'opened Get support'
    result: 'Contact us: +1-200-120-2020 (Available 9am to 5pm PST)'
  E15:
    record: sp_portal/70cd9f3b734b13001fdae9c54cf6a72f
    field: url_suffix
    how: read the portal
    result: esc; favorites switched on
    hash: 177b7cb0686749afeb39817e294fe04d1a4b59a2841ed24dc027cafecad04b48
---
Employee Center is the IT website for everyone who works here: you search it, report problems,
order things, approve your team's orders and follow everything you asked for. It's at **/esc**
on the instance. [E15]

{{animation:esctour}}

## The page at a glance

Every page has the same frame. [E01]

| Where | What it is | Use it to… |
|---|---|---|
| **Search** (top) | one box for the catalog and the help articles [E06] [E07] | find a form, an item or an answer by its name |
| **My Tasks** | what is waiting for you, such as approvals [E09] [E10] | approve or reject what your team ordered |
| **My Requests** | everything you reported or ordered [E08] | see where it is and add information |
| **My Favorites** | items and topics you marked with the heart | come back to them fast |
| **Bell** | notifications about your requests [E11] [E12] | see what changed since you last looked |
| **Your picture** | Profile and Logout [E13] | check your details |
| **Home** (left) | the home page | start again |
| **Help center** (left) | the topics, starting with **Technology services** [E04] | browse when you don't know the name |
| **Get support** (left) | how to contact the service desk by phone [E14] | call when it's urgent |
| **Chat button** (bottom right) | Now Support, the Virtual Agent [E01] | ask a quick question |

## The home page

From top to bottom [E02] [E03]:

- **Search**: type what you need, such as *laptop*, *VPN* or *password*.
- **Quick links**: shortcuts, here **System status** (is a service down?) and **Request
  Standing Desk**.
- **Popular topics**: Email accounts, Software issues, Accessories, Computers, Software, Developer
  services, Technology services, Phone and mobility.
- **Recommended for you**: help articles you may need.
- **My active items** (right): how many **Tasks**, **Requests** and **Surveys** you have open.
  Choose one to open its list.
- **My favorites**: what you marked with the heart.

## Search or browse

**Search** when you know what you want. The results mix items you can request (with their price)
and help articles; choose **Catalogs** or **Knowledge Bases** on the left to keep only one kind,
and filter by topic. [E06]

**Browse** when you don't. Topics nest: **Help center › Technology services › Hardware ›
Computers**. [E04] [E05] Each topic page lists its **Support resources**, articles and requests
together; set **Filter by** to *Requests* to see only what you can order, and **Sort by** to
*A-Z* to scan the list. [E04]

See [Find what you need](see:request/find) for ordering and [Report an incident](see:incident/report)
for problems.

## Follow what you asked for

- **My Requests** has two tabs: **Submitted requests** and **Drafts**. Switch **View** between
  *Open requests* and *Closed requests*. [E08]
- **My Tasks** lists what is waiting for you, with **Open** and **Completed**. [E09]
- The **bell** shows a count when something changed: a request created, approved, rejected or
  completed, or a comment on your item. [E12] Mark one as read, keep it as a reminder or clear it;
  **Mark all as read** clears the count. [E11]

## Tips

- Mark items you order often with the heart: they appear in **My favorites** on the home page.
- Read the article first: for many questions, **Recommended for you** or a search answers it
  faster than a ticket.
- Can't find it? Use the chat, or report it as an incident and say what you need in your own
  words.

## I want to…

| I want to… | Go to |
|---|---|
| know which way to contact IT | [Ways to get help](see:channels) |
| order something | [Find what you need](see:request/find) |
| report something that isn't working | [Report an incident](see:incident/report) |
| understand my request's status | [Your request's statuses and emails](see:request/statuses) |
