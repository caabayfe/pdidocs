---
title: Assign an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_script/27453ac6b73610102d2fbc16de11a937
    how: read Populate Assignment Group based on CI/SO
    result: with no group and no assignee, a configuration item or service offering fills the group with its support group
    hash: c862798729dd0aa29d354614c6d0615e575d3b6347f2f777c060654cde079661
  E02:
    record: sys_script/6a2e9d1453e80010833addeeff7b124f
    how: read Abort changes on group
    result: the save is refused when the assignee is not a member of the group
    hash: b41fef5642903ef5b4c95a14b9424211b8b06437bf74e7ea0508635c53128b02
  E03:
    record: sys_script/6fab2e470a0007045931f2a692878933
    how: read Incident State Active on Assignment
    result: a New incident that gets an assignee moves to In Progress
    hash: 56d370b105abf6182b075b4936fd79acbee1bd08cfaaef3435ce7f1cd8cb0d05
  E04:
    record: sys_ui_action/3b991ad673da20103e366238edf6a7f3
    how: read Assign to me (list menu)
    result: for agents who are members of the incident's group; fills the group when you belong to exactly one
    hash: 4019b27e8dffe97775c2071bd80e2602eb48e6897b31e62b1490fa13f918509c
---
## Who gets the incident

Every incident needs a **team** (*Assignment group*) and, once someone takes it, a **person**
(*Assigned to*) from that team.

{{animation:incasg}}

- **The team often fills in by itself.** If you leave the group empty and choose a
  configuration item or a service offering, the incident goes to the team that supports it. [E01]
- Otherwise, choose the **Assignment group** yourself. The team is notified.

## Take an incident

From **Incident › Open - Unassigned** (or your team's queue), right-click the incident and
choose **Assign to me** (in the agent workspace, open it and press **Assign to me**). You must be a member of the
incident's team. If it has no team and you belong to only one, your team is filled in. [E04]

As soon as a **New** incident has someone assigned, it moves to **In Progress**. [E03] You get
an email that it was assigned to you.

## Pass it to another team

Change the **Assignment group**. The person in *Assigned to* is cleared if they aren't in the new
team. Write a **work note** explaining why, so the next team doesn't start from zero.

## If the save is refused

*"Assigned to user … must be member of Assignment group …"* means the person you chose is not
in that team. [E02] Pick someone from the team, or clear *Assigned to* and let the team take it.

## Tips

- Assign to a team, not straight to a person, unless you agreed it with them: the team sees
  the queue, a person can be away.
- Only people with the service desk role can be assigned.
