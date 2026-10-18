---
title: How incident management works
reviewed: 2026-10-17
evidence:
  E01:
    record: sc_cat_item_producer/3f1dd0320a0a0b99000a53f7604a2ef9
    how: read the Create Incident record producer
    result: the main way to report an incident on the portal
    hash: b5eafb4f7f71e6a85026f47dc581a0a5162d194d150f51e5a8fcc06844f99df0
  E02:
    record: sys_ux_list_category/0917129ec3013010965e070e9140ddff
    how: read the Incidents list category of the Service Operations Workspace
    result: lists Assigned to you, Unassigned, Open, Resolved, All
    hash: a51700f52c9f68650a14710c5596e17bf3545685eb55f0cad91d11a02d1d08e0
  E03:
    record: sys_app_application/dead1309c611228701e2bda7b4252474
    how: read the Incident application menu
    result: the classic interface's Incident menu, for itil and sn_incident_read
    hash: 74c534b5e9f71aca880f1ef69e87cd243576092e352644a8a91f71474f0a5e4b
  E04:
    record: sys_properties/d5c62446c0a8011800cdf450892cec2d
    field: value
    how: 'read glide.ui.autoclose.time'
    result: '7 days'
    hash: 7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451
---
## What an incident is

An **incident** is anything that stops you working or makes your work harder than it should be: a
laptop that won't start, an application that shows an error, a printer that's out, a network
that's slow. Asking for something new (access, software, equipment) is a **request**, not an
incident.

Each incident gets a number starting with **INC**. Quote it whenever you talk about it.

## The journey of an incident

1. Someone reports it, on the portal, by email or by phone.
2. The service desk records it, decides how urgent it is, and sends it to the right support team.
3. A person in that team works on it, and asks the person who reported it when they need
   something.
4. When it is fixed, it is **resolved**, and the person who reported it confirms or reopens it.
5. Once confirmed, or after 7 days without an answer, it is **closed**. [E04]

## Where you start {for=user}

You report and follow your incidents in **Employee Center**: search for **Create Incident** to
report one, and open **My Requests** to see where they are. [E01] You can also email the service
desk, or call it.

The pages of this guide for you:

- [Report an incident](see:report): from the portal, by email or by phone.
- [Follow your incident](see:follow): see where it is, answer questions, add information.
- [Confirm the fix, or reopen](see:confirm): say whether it works.

## Where you start {for=operator}

You work on incidents in the **Service Operations Workspace**, under **Incidents**: *Assigned to
you*, *Unassigned*, *Open*, *Resolved* and *All*. [E02] The classic interface has the same lists
under the **Incident** menu. [E03] The operator guides describe the workspace and note where the
classic form differs.
