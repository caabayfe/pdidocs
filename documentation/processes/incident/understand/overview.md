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
3. A person in that team works on it, and asks the caller when they need something.
4. When it is fixed, it is **resolved**, and the caller confirms or reopens it.
5. Once confirmed, or after a few days without an answer, it is **closed**.

## Where you start {for=user}

You report and follow your incidents in **Employee Center**: **Help center › Technology services ›
Create Incident** to report one, and **My Requests** to see where they are. [E01] You can also
email the service desk, or call it.

The pages of this guide for you:

- *Report an incident*: from the portal, by email or by phone.
- *Follow your incident*: see where it is, answer questions, add information.
- *Confirm the fix, or reopen*: say whether it works.

## Where you start {for=operator}

You work on incidents in the **Service Operations Workspace**, under **Incidents**: *Assigned to
you*, *Unassigned*, *Open*, *Resolved* and *All*. [E02] The classic interface has the same lists
under the **Incident** menu. [E03] The operator guides describe the workspace and note where the
classic form differs.
