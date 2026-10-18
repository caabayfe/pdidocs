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
  E06:
    record: sys_declarative_action_assignment/3838c09753213010ae50ddeeff7b1253
    how: read Add (Service Operations Workspace, incident related list)
    result: 'action "Add" on the list of incidents whose parent incident is the open record'
    hash: a0d5c9b2930645549eb5f3028bb90304a1b9d6faa6a8a509f2daba23b5dea27c
  E09:
    record: sys_declarative_action_assignment/fc6a887c53713010ae50ddeeff7b1288
    how: read New (Service Operations Workspace, same list)
    result: 'action "New" creates an incident with the open record as parent'
    hash: b3427b467af5d15e416acfeb93a9de1092844c7168deaf56d15658c785c8d2eb
  E10:
    record: sys_declarative_action_assignment/ca3010db53213010ae50ddeeff7b12ef
    how: read Remove (Service Operations Workspace, same list)
    result: 'action "Remove" on the selected child incidents'
    hash: 607a8d9e164962ca6d723b1735e24d7acc398349a43a61a0ab58c5b11a70cb90
  E07:
    record: sys_ui_section/991fec850a0006417c9edda2d4e9c487
    children: sys_ui_element
    how: read the classic incident form's Related Records section
    result: parent incident, problem, change request, caused by
    hash: 526106c5de8d52363e7206a84285e6340d6a053bcea1c13b9525361fdf9964f7
  E08:
    record: sys_ui_section/8f2f419653533010ae50ddeeff7b1248
    children: sys_ui_element
    how: read the workspace incident form's Related Records section
    result: parent incident, problem, change request, caused by
    hash: 162ed219efd66183c54b7b956d797d2526aae8c5c5fa4cef4de1ad551821edfa
---
## Link from a list (classic)

{{animation:mimlink}}

1. In the classic interface, open a list of the reports, for example **Incident › Open**, and
   select them.
2. Choose **Link to Major Incident** in the list's actions. The dialog **Choose a Major
   Incident** opens and lists the active major incidents. [E01]
3. Pick the major incident and press **OK**. Each selected incident gets it as its parent. [E01]

## Link from the workspace

In the Service Operations Workspace, open the major incident and go to the list of its child
incidents: **Add** links existing incidents, **New** creates one already linked, and **Remove**
unlinks the ones you select. [E06] [E09] [E10]

## Link one incident

On a single incident, set **Parent Incident** in its **Related Records** section, on the classic
form or in the workspace. [E07] [E08]

## What a linked incident does

- It takes the major incident's state, and follows it from then on. [E02] [E03]
- Comments you write on the major incident are copied to it, and emailed to its caller; work notes
  are copied too, for the team. [E04]
- When the major incident is resolved, it is resolved with it. [E04]

So write to affected users once, on the major incident.

A major incident can't be linked under another incident, and a candidate that you link stops
being a candidate. [E05]

## What happens next

Follow the response from [Run the response](see:run); callers see the updates as described in
[Follow an outage](see:follow).
