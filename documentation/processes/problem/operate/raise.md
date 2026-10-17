---
title: Raise a problem
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_app_module/a1beba50c611227801908558c921ab78
    how: read Problem › Create New
    result: roles itil and sn_problem_write
    hash: 5b896436e1d71b9e7ab38c888e6a14d1beb5449de7882b6e29df760aaeb95610
  E02:
    record: sys_ui_section/bfb81dc9c0a8000900127627db594210
    children: sys_ui_element
    how: read the problem form's main section
    result: number, origin task, category, subcategory, service, offering, CI; model, state, impact, urgency, priority, group, assigned to; problem statement, description
    hash: 12f276a4ce5de469835463d040f4dd22ba16e5355f5c1a589518bb49fd1534b2
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'classic problem form, PRB0007601'
    how: 'read the form'
    result: 'process flow New › Assess › Root Cause Analysis › Fix in Progress › Resolved › Closed; the short description is labelled Problem statement; tabs Notes, Analysis Information, Resolution Information, Other Information'
  E04:
    record: sys_dictionary_override/57b3fafd534823004247ddeeff7b12d3
    how: read the problem Assigned to override
    result: only users with problem_coordinator can be chosen
    hash: c97ac6c31436fff661daae7a75741054f3a8c05f1a71c9f62a56e3ee299e664d
  E05:
    record: sys_script/5e0a54b0c7715010c24ae122c7c260f1
    field: script
    how: read Update Problem State to Assess
    result: a New problem saved with an assignee moves to Assess
    hash: 71bfed01224a6eda747b1fc083b209e6ed45114fccd0ab5b57cdb7a2af040c06
  E06:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Incident form, Service Operations Workspace and classic'
    how: 'opened the incident create menus'
    result: 'neither offers Create problem'
---
## When to raise one

- The same incident keeps coming back.
- Many incidents share a cause, even after a major incident is over.
- One incident had a cause worth removing so it can't happen again.

## Raise it

{{animation:prbraise}}

1. Open **Problem › Create New**. [E01] An incident can't create one: neither the workspace nor
   the classic incident form offers *Create problem*. [E06]
2. Fill the form: **Problem statement** (one line), **Description**, **Category**, the
   **Configuration item** or **Service**, **Impact** and **Urgency**. [E02] [E03]
3. Choose the **Assignment group** and, in **Assigned to**, a problem coordinator: only
   coordinators can be chosen. [E04]
4. Save. With an assignee it moves straight to **Assess**. [E05]

Then link the incidents: [Link incidents to a problem](see:link).
