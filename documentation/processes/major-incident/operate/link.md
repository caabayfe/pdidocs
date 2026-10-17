---
title: Link the other reports
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/8b3f9b22532743006725ddeeff7b1295
    how: read Link to Major Incident (list action, roles itil and sn_incident_write)
    result: 'dialog "Choose a Major Incident" lists active accepted major incidents; sets the parent on each selected incident'
    hash: aa342e24c8e23080d6d12819e96cb57d2352e3221bcdf37f5c921f6d631184ce
  E02:
    record: sys_script/c778e740b7713300f9519c75de11a99f
    field: script
    how: read Derive State value from Parent Incident
    result: a linked incident takes the parent's state and on hold reason
    hash: af6a1cf8e8a24f58a32f4e4244c35e4ba89db1909211a2a14a68c96bcd60e211
  E03:
    record: sys_script/eb8fa5b00b3332001604628393673a96
    field: script
    how: read Sync Child Incident State
    result: later state changes of the parent reach its active children
    hash: c5efc34efd4512661810ff0ec6a03d92497dc35659d9911c1e78149a14cb2c42
  E04:
    record: sys_script/8f61f1b00a0a3c7401aac471d27a2718
    field: script
    how: read Update Child Incidents
    result: comments and work notes copied to children; children resolved with the parent
    hash: 917e3d1c68b281ba6c81a50742086ef60a396d924b925e0c51b7051932a9e261
  E05:
    record: sys_script/a83197ca3b10030050bec9bb34efc4a8
    how: read Child incident cannot be major incident
    result: a major incident can't become a child; a candidate that does stops being one
    hash: 8677f05697797e9abf18c50da46b6b22ab90cce797f3446428c47d8da60f6ea1
---
## Link from a list

{{animation:mimlink}}

1. Open a list of the reports, for example **Incident › Open**, and select them.
2. Choose **Link to Major Incident** in the list's actions. [E01]
3. In **Choose a Major Incident**, pick the major incident and press **OK**.

You can also set **Parent Incident** in an incident's *Related Records* section, or add children
from the workbench (see [Run the response](see:run)).

## What a linked incident does

- It takes the major incident's state, and follows it from then on. [E02] [E03]
- Comments you write on the major incident are copied to it, and emailed to its caller; work notes
  are copied too, for the team. [E04]
- When the major incident is resolved, it is resolved with it. [E04]

So write to affected users once, on the major incident.

A major incident can't be linked under another incident, and a candidate that you link stops
being a candidate. [E05]
