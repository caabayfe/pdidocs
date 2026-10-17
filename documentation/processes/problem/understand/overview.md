---
title: How problem management works
reviewed: 2026-10-17
evidence:
  E01:
    record: sysevent_script_action/315aa414534123004247ddeeff7b1240
    field: script
    how: read Update Incident when Problem closes
    result: incidents On Hold for Awaiting Problem are resolved when the problem closes with Fix Applied
    hash: 05ad6dee5b208584f1f5ea888e7cb64d0efa10da0a9cb80903a7db107fb633dd
  E02:
    record: sys_properties/cb0e6a0b43100210644b3d1e2ab8f2a6
    field: value
    how: read com.snc.problem_management.models.enabled
    result: true; new problems get the model General
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Service Operations Workspace › List › Default lists'
    how: 'read the list categories'
    result: 'Interactions, Requests, Catalog tasks, Incidents, Tasks, Approvals, CMDB, Knowledge; no Problems'
---
## Problems and incidents

An **incident** gets one person working again. A **problem** removes the cause, so the incidents
stop: a printer that fails every Monday, an application that crashes after each update. While the
cause is worked on, a **workaround** keeps people working; when it is fixed, the incidents waiting
for it are resolved. [E01]

## How it goes

1. Someone **raises** a problem and links the incidents that share the cause.
2. A **problem coordinator** assesses it and confirms it; the **root cause analysis** follows,
   often as problem tasks.
3. A **workaround** is shared with the support teams, and a **known error** article published.
4. The **fix** is made, usually through a change; the problem is **resolved**, then **completed**.

Every new problem follows the model *General*. [E02]

### What it means for you {for=user}

You don't see problems; you see your incident. If it is waiting for a problem fix, the service desk
puts it on hold and it is resolved when the fix is in: see
[When a problem is behind your incident](see:affected).

### Where you start {for=operator}

Problems are worked on the **classic form**, under **Problem** in the navigator; the Service
Operations Workspace has no problem lists. [E03] Start with [Raise a problem](see:raise).
