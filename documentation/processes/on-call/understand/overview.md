---
title: How on-call scheduling works
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records, with and without the active filter
    how: opened the list of shifts in the classic interface
    result: No records to display
  E02:
    record: sys_app_application/e1e620df0a0a0aa0018366fc46766dfc
    how: read the On-Call Scheduling application menu
    result: active, for itil, roster_admin, rota_admin, rota_manager and oc_read, as delivered on this instance
    hash: 29fcc21ba8310efa519d1aab6a2ccbe7277dc5cc27bb5b424421cc4ec76103c5
  E03:
    record: sys_db_object/a1e196cf83778310292aca75eeaad366
    how: read the cmn_rota table
    result: labelled Shift
    hash: 7cbbba506f1005b49a1e96ac07c799bc6c837bdacb6744fc403d5c9a8f480fad
  E04:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC.process
    result: 'a trigger rule acts only on a record whose assignment group is set and whose assignee is not a member of that group; it then runs the rule''s script or subflow, after cancelling any on-call subflow already running on the record'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E05:
    record: sys_properties/5bcd60b29380221067c612f984891815
    field: value
    how: read glide.oncall.only_flow_enabled_release
    result: true; only subflow-based on-call invocations are supported
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E06:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: 'for incident, problem and change_request, applies only to a group with a shift (any, even a draft); it then adds the first on-call person of each roster ("On-Call members of {0} joined the discussion", or "No members currently on-call for {0} group")'
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E07:
    record: sys_ux_client_script/54d613cda31b121008faa0cbf31e6134
    field: script
    how: read Check on-call is active (Service Operations Workspace)
    result: the workspace's on-call pages need both com.snc.on_call_rotation and com.snc.sow_on_call; the mirror's plugin list has the first and not the second
    hash: 202dde27c69b2ff7aa5f980b15cbea130ba934451af82004662371359a37af53
  E08:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: /now/on-call-scheduling
    how: opened the workspace on-call scheduling page
    result: The page you are looking for could not be found
---
## What it is for

Some support groups need someone available outside office hours. On-call scheduling plans that
person: each group can have one or more **shifts** [E03], each shift has **rosters** that rotate through their **members**, and time off or cover
replaces a member for a while. When urgent work reaches the group, the on-call flows find who is on
call and contact them in turn until someone takes it.

## On pdi2 today {for=operator}

The On-Call Scheduling application is installed and its menu is active, as delivered on this
instance [E02], but **no group has a shift yet**: the list of shifts is empty [E01]. So:

- nobody is on call, and the on-call calendars show nothing;
- the on-call flows never run, because they only act for groups with a shift [E04];
- inviting a group to a Sidebar discussion adds the whole group, not just who is on call [E06]
  (see [Discuss an incident with colleagues](see:incident/discuss)).

Everything below describes what the platform does once a group has a shift.

## How it goes {for=operator}

1. An **on-call administrator** or the group's **shift manager** creates a shift for the group,
   adds rosters and members, and publishes it.
2. Members check when they are on call, set how they want to be contacted, and arrange time off
   or cover.
3. An administrator adds a **trigger rule**: when an incident (or another task) is assigned to a
   group with a shift and nobody in that group is assigned yet, the rule starts an on-call subflow
   [E04]. Only subflows are supported on this release [E05].
4. The subflow creates an **escalation**: it assigns the person on call, or contacts the people
   in the escalation policy one after another, by email, SMS or voice, until one accepts.

### Where you start {for=operator}

On-call scheduling is worked in the **classic interface**, under **On-Call Scheduling** in the
navigator [E02]. The Service Operations Workspace has no on-call pages on pdi2: they need a
plugin the instance doesn't have [E07], and the page doesn't open [E08]. Start with
[See who is on call](see:see-on-call).
