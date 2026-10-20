---
title: See who is on call
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
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Schedules ($oc_groups.do)
    how: opened On-Call Scheduling › On-Call Schedules
    result: 'tabs Pinned On-Call Schedules, My On-Call Schedules, All On-Call Schedules; search by Group / Schedule; the Pinned tab shows the "To pin an On-Call Schedule…" hint'
  E03:
    record: sys_app_module/ceb8ca1bd7c00300532c24837e610338
    how: read the On-Call Schedules module
    result: opens $oc_groups.do; no role on the module itself
    hash: fa2d0f8740cbe4a8802eb1e6efcd9d6e00bc5306ee614e085c53685abeeb5aec
  E04:
    record: sys_script_include/cbf1a0c2c3011200b6dcdfdc64d3ae6a
    field: script
    how: read OCCalendarUtils.canRead, which the On-Call Schedules page calls before it shows anything
    result: 'the reader needs one of the roles in com.snc.on_call_rotation.calendar_read_roles; without the property, itil, roster_admin, rota_admin or rota_manager'
    hash: a15ef7e7216a26fa2ee84cd1344de8fd4d60ae316e4d1b9b730c01b0c19997aa
  E05:
    record: sys_ui_script/81e734b1d7000300532c24837e610361
    field: script
    how: read the labels of the On-Call Schedules app (sn.on_call.now)
    result: 'Search On-Call Schedules, Group / Schedule, Pin On-Call Schedule, Unpin On-Call Schedule, "Nobody is On-Call now", "On-Call Members will be available today from:", Show escalation details, Roster and escalation details, User name, User title, User email, User contact number, Manager, Send a direct message, "{0} Pending actions, {1} gaps identified, {2} conflicts identified, {3} time off requests"'
    hash: 2bd5f3de17aa22e80df5efcace070375044ab802c0f935cecac1d745bbf3a196
  E06:
    record: sys_app_module/4711d650c0a8170100d6a46d79493f13
    how: read the On-Call Calendars module
    result: opens the on-call calendar launcher; no role on the module
    hash: 504359ef2649d5f34ff909d9997c18ca779880090f81b36effa85c4108d7d31a
  E07:
    record: sys_app_module/c9d8b179c0a80165003dbc2fcf6a0ec6
    how: read the Schedule Report module
    result: opens the on_call_schedule_report page; no role on the module
    hash: 594af3ecfa95cf8f82dd486d51139ad2f5ad80dd7d0cb980c8bbce3c3fd0b3bd
  E08:
    record: sys_ui_page/e9513e61c0a8016400ab81efe6a9d2dd
    field: client_script
    how: read on_call_schedule_report
    result: '"Please select at least one group"; with 200 groups or more: "Please select fewer than 200 groups or change report style to: Table."'
    hash: 217b73fdb6ce618a70b2cf0b8bde099abee45a5d2856c7b388518bd51b9fe8e7
  E09:
    record: sys_app_module/a629e00c0f4010101d6d6bfaa8767e93
    how: read the Overview module
    result: 'roles itil and rota_admin; opens the on-call dashboard (on_call_dashboard_launcher_v2)'
    hash: 37cf1299054c4d202aec0faee8ddfcfa9a1f90ba38a7ff3cfccd6fc71be0f32c
  E10:
    record: sys_app_module/0148065ec0a8170100e3fce043520d86
    how: read the My Group Schedules module
    result: the list of shifts (cmn_rota); no role on the module
    hash: 3474d65d946e2baeea37e7e34b479cb7359da1236578b2d0cb9f9286eb15e4d0
  E11:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: 'for incident, problem and change_request, when the group has a shift: adds the first person on call in each roster, with "On-Call members of {0} joined the discussion", or "No members currently on-call for {0} group"'
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E12:
    record: sys_ui_action/7e86cef1b70123003e36b956ee11a984
    how: read On-Call Roster and Escalation details (incident, form link)
    result: inactive; it would open who is on call for the assignment group in a dialog
    hash: 4fe17fe9eb64d79ee7d4ce348094dcd7bc4f8ec6eaf22ee07224e5830b5fd27b
  E13:
    record: sys_app_module/7292dceaac110140003a6fdda1af187b
    how: read the Escalations Report module
    result: opens the on_call_escalation_report page; no role on the module
    hash: b6bf964774771e57467325e7197e3527668de9d12a2e4f777a3d2baef9fdc1ec
---
## On pdi2 today {label=NEW}

**Nobody is on call on pdi2**, because no support group has a shift yet: the list of shifts is
empty. [E01] The pages below open, but have nothing to show. When a group needs someone out of
hours, its shift manager sets one up first (see [Set up and maintain a shift](see:set-up-shift)).

Until then, call or invite the group's members as you normally would.

## Where to look {label=NEW}

Everything is in the classic interface, under **On-Call Scheduling** in the navigator. [Q20]

| Module | Shows | Who sees it |
|---|---|---|
| **On-Call Schedules** | a card per group: who is on call now, and the shift's escalation [E02] [E05] | anyone with a calendar-read role, such as `itil` [E03] [E04] [Q17] |
| **On-Call Calendars** | each group's shifts, rosters and time off on a calendar [E06] | the same [E04] |
| **Schedule Report** | who is on call over a period, for the groups you pick [E07] [E08] | the same |
| **Overview** | the on-call dashboard: gaps, conflicts and pending actions [E09] | `itil` and `rota_admin` [E09] |
| **My Group Schedules** | the list of shifts of your groups [E10] | the same |
| **Escalations Report** | the escalations that have run [E13] | the same |

## Find who is on call for a group {label=NEW}

{{animation:ocwho}}

1. Open **On-Call Scheduling › On-Call Schedules**. [E03]
2. Use the tabs [E02]:

   | Tab | Shows |
   |---|---|
   | **My On-Call Schedules** | the shifts you manage or are a member of [E05] |
   | **All On-Call Schedules** | every group with a shift |
   | **Pinned On-Call Schedules** | the ones you pinned |

3. Search by **Group / Schedule**. [E02] [E05]
4. Each card shows who is on call now, or *Nobody is On-Call now*. When nobody is on call yet
   today, it says *On-Call Members will be available today from:* and the time. [E05] [Q21]
5. Open the person to see their **title**, **email**, **contact number** and **manager**. [E05]
6. **Show escalation details** gives the order in which people would be contacted. [E05]

To keep a group at hand, point to its card on **All On-Call Schedules** and choose **Pin**. [E02]
[E05]

For a period instead of now, use **Schedule Report** and pick at least one group; with 200 groups
or more, choose the *Table* style. [E08]

## Bring the on-call people into a discussion {label=NEW}

In the Service Operations Workspace, when you add a **group** to a Sidebar discussion on an
incident, problem or change, and that group has a shift, only the people on call are added: the
first person on call in each roster. The discussion says *On-Call members of … joined the
discussion*, or *No members currently on-call for … group* if nobody is. [E11]

On pdi2 no group has a shift, so adding a group adds all its members. [E01] [E11] How to start a
discussion is in [Discuss an incident with colleagues](see:incident/discuss).

## Tips

- Check **On-Call Schedules** before you call someone out of hours: the card gives the number to
  call. [E05]
- A major incident manager can pin the groups that major incidents usually need. [E05]
- The *On-Call Roster and Escalation details* link on the incident form is switched off on pdi2;
  use **On-Call Schedules** instead. [E12] [Q08]
