---
title: See who is on call - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_app_application/e1e620df0a0a0aa0018366fc46766dfc
    how: read the On-Call Scheduling application menu
    result: active, for itil, roster_admin, rota_admin, rota_manager and oc_read
    hash: 29fcc21ba8310efa519d1aab6a2ccbe7277dc5cc27bb5b424421cc4ec76103c5
  E02:
    record: sys_app_module/ceb8ca1bd7c00300532c24837e610338
    how: read On-Call Schedules
    result: 'DIRECT link to $oc_groups.do, order 300, no roles'
    hash: fa2d0f8740cbe4a8802eb1e6efcd9d6e00bc5306ee614e085c53685abeeb5aec
  E03:
    record: sys_ui_page/b53fad60d7010300532c24837e61036b
    field: html
    how: read the $oc_groups UI page
    result: 'renders only when OCCalendarUtils.canRead() is true; loads the AngularJS app sn.on_call.now (GroupOnCallController); adds the Notify WebRTC phone when com.snc.notify is active; asks OnCallCommon whether Slack or Microsoft Teams direct messages are used'
    hash: 4053d44a5f2959e3c77ff8eba7b8ff0016b967888fb7c845bb06f8b640625776
  E04:
    record: sys_script_include/cbf1a0c2c3011200b6dcdfdc64d3ae6a
    field: script
    how: read OCCalendarUtils
    result: 'canRead checks the roles in com.snc.on_call_rotation.calendar_read_roles (default itil,roster_admin,rota_admin,rota_manager); canWriteByGroupSysId asks OnCallSecurityNG.rotaMgrAccess for the group'
    hash: a15ef7e7216a26fa2ee84cd1344de8fd4d60ae316e4d1b9b730c01b0c19997aa
  E05:
    record: sys_properties/eea1d72ac3011200b6dcdfdc64d3aeab
    how: read com.snc.on_call_rotation.calendar_read_roles
    result: the list of roles that can read the calendar; the value is redacted in the mirror
    hash: 7710992bb1d3ac2ea7669d1a956e0d79ee33ee884520f8561bcb976ec0151b8b
  E06:
    record: sys_ui_script/81e734b1d7000300532c24837e610361
    field: script
    how: read sn.on_call.now
    result: 'the tabs Pinned, My and All On-Call Schedules, pinning, the on-call card ("Nobody is On-Call now"), the user details and "Roster and escalation details"; a landing summary of pending actions, gaps, conflicts and time off requests'
    hash: 2bd5f3de17aa22e80df5efcace070375044ab802c0f935cecac1d745bbf3a196
  E07:
    record: sys_properties/b69664dd5f652300200aa184ff4666bd
    field: value
    how: read com.snc.on_call_rotation.landing_page.show_pending_actions
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E08:
    record: sys_app_module/4711d650c0a8170100d6a46d79493f13
    how: read On-Call Calendars
    result: '$oc_calendar_launcher_redirect.do, order 400, no roles'
    hash: 504359ef2649d5f34ff909d9997c18ca779880090f81b36effa85c4108d7d31a
  E09:
    record: sys_ui_page/c95edfcb43015210b8e69cd82ab8f24b
    field: client_script
    how: read $oc_calendar_launcher_redirect
    result: redirects to on_call_rotation_calendar_launcher.do
    hash: 9ca659f658cffd6c860be38f79ce53a6461ad1b1fada214629a54f1dd503bb92
  E10:
    record: sys_properties/7298a822d7001200f2d224837e6103db
    field: value
    how: read com.snc.on_call_rotation.show_legacy_calendar
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E11:
    record: sys_app_module/c9d8b179c0a80165003dbc2fcf6a0ec6
    how: read Schedule Report
    result: 'ui_page.do?name=on_call_schedule_report, order 1200, no roles'
    hash: 594af3ecfa95cf8f82dd486d51139ad2f5ad80dd7d0cb980c8bbce3c3fd0b3bd
  E12:
    record: sys_ui_page/e9513e61c0a8016400ab81efe6a9d2dd
    field: client_script
    how: read on_call_schedule_report
    result: at least one group; fewer than 200 groups unless the report style is Table
    hash: 217b73fdb6ce618a70b2cf0b8bde099abee45a5d2856c7b388518bd51b9fe8e7
  E13:
    record: sys_properties/bba85e12b79740100c548d58de11a9b5
    field: value
    how: read com.snc.on_call_rotation.reports.max_duration_in_days
    result: '40'
    hash: d59eced1ded07f84c145592f65bdf854358e009c5cd705f5215bf18697fed103
  E14:
    record: sys_app_module/a629e00c0f4010101d6d6bfaa8767e93
    how: read Overview
    result: 'on_call_dashboard_launcher_v2_intermediate_page.do, order 1090, roles itil and rota_admin'
    hash: 37cf1299054c4d202aec0faee8ddfcfa9a1f90ba38a7ff3cfccd6fc71be0f32c
  E15:
    record: sys_ui_page/39668811ff8032108c5fffffffffffd0
    field: html
    how: read on_call_dashboard_launcher_v2_intermediate_page
    result: redirects to on_call_dashboard_launcher_v2.do
    hash: 04d830cfcf42bd593d50741350dfe44a723c7f50f67b787efac01fbf3b7f3d1f
  E16:
    record: sys_extension_instance/29c7a32b7706021084ef1aceca5a99f6
    how: read the extension instance in sn_sow_collab
    result: 'registers OnCallSidebarGroupMemberResolver on the extension point sn_oe_sfs.SidebarGroupMemberResolver, order 100'
    hash: 8c26b1c43feaa9a40773df87b22ac75526a1639c99808e5ea066c66c20ef68d7
  E17:
    record: sys_script_include/d9c7a32b7706021084ef1aceca5a99f2
    field: script
    how: read OnCallSidebarGroupMemberResolver
    result: 'applies to incident, problem and change_request when any cmn_rota exists for the group (active or not); resolves to OnCallRotation.whoIsOnCall, one user per roster'
    hash: f21c54bcfe5ffd7d23458c52205ea72a6b2c14d88822505f9377dcc00226a019
  E18:
    record: sys_ui_action/7e86cef1b70123003e36b956ee11a984
    how: read On-Call Roster and Escalation details
    result: 'incident, form link, inactive; condition: an assignment group with active shifts, and canRead; opens $on_call_who_and_escalation in a modal'
    hash: 4fe17fe9eb64d79ee7d4ce348094dcd7bc4f8ec6eaf22ee07224e5830b5fd27b
  E19:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records
    how: opened the list of shifts
    result: No records to display
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| global (On-Call Scheduling, `com.snc.on_call_rotation`) | the navigator modules, the On-Call Schedules and calendar pages, the reports [E01] [E02] |
| `sn_sow_collab` | resolving a group to its on-call people when it is added to a Sidebar discussion [E16] |

On pdi2 no shift exists [E19], so every page here is empty and the Sidebar resolver never applies.
[E17]

## 1. Who can open the pages {label=NEW}

1. The application menu is shown to `itil`, `roster_admin`, `rota_admin`, `rota_manager` and
   `oc_read`. [E01]
2. The modules for seeing who is on call have no roles of their own. [E02] [E08] [E11]
   **Overview** needs `itil` or `rota_admin`. [E14]
3. The pages themselves check `OCCalendarUtils.canRead`: one of the roles in
   `com.snc.on_call_rotation.calendar_read_roles`. [E03] [E04] The property's value is redacted
   in the mirror; without it, the default is `itil`, `roster_admin`, `rota_admin`,
   `rota_manager`. [E05]
4. Changing a group's schedule needs shift-manager access for that group (`rotaMgrAccess`). [E04]

## 2. On-Call Schedules {label=NEW}

`$oc_groups.do` is a UI page that loads the AngularJS app `sn.on_call.now`. [E03] Its labels are in
the UI script [E06]:

- tabs **Pinned**, **My** and **All On-Call Schedules**, with search by group or schedule;
- a card per group with who is on call now and **Roster and escalation details**;
- the person's name, title, email, contact number and manager;
- a summary of pending actions, gaps, conflicts and time off requests, shown because
  `landing_page.show_pending_actions` is true. [E07]

The page adds a WebRTC phone when Notify is active, and a direct message button when Slack or
Microsoft Teams direct messages are configured. [E03]

## 3. Calendars, reports and Overview {label=NEW}

| Module | Target | Notes |
|---|---|---|
| On-Call Calendars | `$oc_calendar_launcher_redirect.do` → `on_call_rotation_calendar_launcher.do` [E08] [E09] | the legacy calendar is off [E10] |
| Schedule Report | `on_call_schedule_report` [E11] | at least one group; under 200 unless *Table* [E12]; reports cover at most 40 days [E13] |
| Overview | `on_call_dashboard_launcher_v2.do` [E14] [E15] | `itil`, `rota_admin` |

## 4. Sidebar discussions {label=NEW}

1. The extension instance registers `OnCallSidebarGroupMemberResolver` with Sidebar's group member
   extension point. [E16]
2. It applies to incident, problem and change request, for a group with **any** shift, even an
   inactive or draft one. [E17]
3. It adds `OnCallRotation.whoIsOnCall` for the group, keeping the first user per roster. With
   nobody on call it adds nobody and posts *No members currently on-call for … group*. [E17]

So a group with only a draft shift is likely to add nobody to a discussion: the resolver
applies, but nobody is on call from a draft. The participant side of Sidebar is
documented in [Discuss an incident - configuration](see:incident/discuss).

## 5. On the incident form {label=NEW}

The form link *On-Call Roster and Escalation details* would open who is on call for the assignment
group. It is inactive on pdi2. [E18]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.on_call_rotation.calendar_read_roles` | redacted | who can read the calendars [E05] |
| `com.snc.on_call_rotation.landing_page.show_pending_actions` | true | summary on On-Call Schedules [E07] |
| `com.snc.on_call_rotation.show_legacy_calendar` | false | the legacy calendar is hidden [E10] |
| `com.snc.on_call_rotation.reports.max_duration_in_days` | 40 | longest report period [E13] |

## Open questions {label=OPEN-QUESTION}

1. What does `calendar_read_roles` hold on pdi2, and does it include `oc_read`, which the menu
   offers? [E01] [E05]
2. Should a group with only a draft shift really swallow its members when added to a discussion,
   or should shifts be created only when they are ready? [E17]
3. Are Slack or Microsoft Teams direct messages wanted from the On-Call Schedules page? [E03]
4. Should the *On-Call Roster and Escalation details* form link be activated for incidents? [E18]
