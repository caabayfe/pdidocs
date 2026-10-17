---
title: The states of a configuration item
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_db_object/ee02f67b8c9103100a22deb6dd2b4ef2
    children: sys_choice
    how: read the operational status and install status choices
    result: Operational, Non-Operational, Repair in Progress, DR Standby, Ready, Retired; Installed, On Order, In Maintenance, Pending Install, Pending Repair, In Stock, Retired, Stolen, Absent
    hash: 0ad2c1f1f1fd71bcfc237054625e7d36100d2cc9546b5aa8136d4ff182e36fd1
  E02:
    record: sys_script_include/1cf5818a878010100e3dd61e36cb0b4a
    field: script
    how: read TaskUtilsSNC getConfigurationItemFilter
    result: incidents and problems hide CIs in operational states not allowed for new tasks
    hash: fb29844c2ed2602a3fab55d939a18eca34518a7f8a0a36f797fc2fad4a4e3f7c
---
## Two statuses

| Status | What it says | Values |
|---|---|---|
| **Operational status** | whether it works | Operational, Non-Operational, Repair in Progress, DR Standby, Ready, Retired |
| **Install Status** | where it is in its life | Installed, On Order, In Maintenance, Pending Install, Pending Repair, In Stock, Retired, Stolen, Absent |

[E01]

### What you notice {for=user}

Retired applications and services don't appear when you pick one.

### Why it matters {for=operator}

Incidents and problems can't name a CI whose state doesn't allow new work, such as a retired one.
[E02] Keep the statuses right, or the CI you need won't be offered.
