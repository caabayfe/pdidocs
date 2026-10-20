---
title: Close, reopen or cancel an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/bbddb6bbc0a8016400c56236de22441a
    how: read the Close button
    result: shown when IncidentUtils().canCloseIncident(current) allows it
    hash: 764e91a4fe4697cbf9b08461496e666ed89e9a80d39708e642b250c47ad63314
  E02:
    record: sys_ui_action/d2d9d8110a0a3c7401bbadabed9b91db
    how: read the Reopen button
    result: available only for Resolved incidents; a comment is required
    hash: cb3c25612802b851af11edff99ef8db3de7fee5a38dfe691684cc940724eb571
  E03:
    record: sys_script/d67b8d9ec0a80118008cd8f0f7f92fae
    how: read incident autoclose
    result: Resolved incidents not updated for a set number of days are closed automatically
    hash: 60153d464b676eb654bc1347776d9c4ca6b7347e57954cb7d8a0dfbf4eaea129
  E04:
    record: sys_ux_form_action_layout/e28e161b534130108b91ddeeff7b1229
    how: read the workspace's incident header buttons
    result: Assign to me, Close, Resolve, Reopen, a Create menu, and more in the overflow
    hash: 6aaac5eb90654c413ff7e6240b5d2c0fd67d8cc7973321754589141411f3b7a0
  E05:
    record: sys_declarative_action_assignment/05194d0f533152102e4bddeeff7b1298
    field: client_script
    how: read the workspace action Reopen
    result: a Reopen dialog with Additional comments (Customer visible), mandatory
    hash: 3c46c8deed0175d33530dfff49fef052332b717e39b2831082f89ba0b3c150ed
  E06:
    record: sys_properties/d5c62446c0a8011800cdf450892cec2d
    field: value
    how: 'read glide.ui.autoclose.time'
    result: '7 days'
    hash: 7902699be42c8a8e46fbbb4501726517e86b22c56a189f7625a6da49081b2451
  E07:
    record: sys_script/96061c55677032004792adab9485efe1
    how: read Clear Resolve fields
    result: on reopen, Resolved by, Resolved, Resolution code and Resolution notes are cleared
    hash: 32b215e4440f4322bc608f6fe80b6373f34c1d091ea96a29be873f0025d50eaf
  E08:
    record: asmt_condition/249e70b0875013005d90bba826cb0bbf
    how: read the survey trigger ITSM Demo Survey
    result: active; every closed incident sends the caller a survey
    hash: 56d602bed36bac7aac90a4b4aa914cd5f9ff5ebf9f4b34a6d20708364b88eb7a
  E09:
    record: sysevent_in_email_action/498e10410a0a0b4b007c8c7f63531747
    how: read Update Incident (BP)
    result: a reply whose subject contains "please reopen" reopens the incident
    hash: 92b32d15bde5bd99fae5ed3c8dd9770a585acb7d8b0f1d55ddf8db95747a6563
  E10:
    record: sysevent_email_action/5b82abc767a630105f74e8a331b73092
    how: read Incident closed
    result: to the caller when the incident is closed
    hash: cba7ed515e158d791bb4e913f0b8830a2c042abac92927daeef24f92ab4ab704
  E11:
    record: sys_script_include/a1b5e796531232000600e26b88dc3472
    field: script
    how: read IncidentUtilsSNC canCloseIncident and canReopenIncident
    result: close needs Resolved and itil_admin or the caller; an accepted major incident only the caller with any role, or major_incident_manager; reopen not offered for major incidents
    hash: ffcaf34fa9847d8197f844f13f50d9cecdb73af98017c5d0871ec60750488aa8
  E12:
    record: sys_script_client/38c58af84657628200aeb11d8295f42c
    how: read (BP) Hide Choice - Closed
    result: removes Closed from the state list unless the user has itil_admin
    hash: 8afba61fe6018d86a82730eeeeea10cafe534ffea30378fabc4da9da97918dc4
  E13:
    record: sys_script_include/9bca43944f1f02001f6eac118110c7a6
    field: script
    how: read IncidentSNC reopen
    result: a resolved incident goes back to In Progress; a closed one is copied into a new incident
    hash: f941f9b9d0b7125a163b79f9dbeb850bdb35f6c9ee396538deeabd67519c8d58
  E14:
    record: std_ticket_config_action/e17865a5ff0222105146ffffffffffdd
    how: read the Reopen action on the Employee Center ticket page
    result: shown on a resolved incident to the caller or the person who opened it
    hash: f5c6c6461de898689181036900c6bd47b5a9e1f6fa1a0eb619a7d41551843dca
---
## Closing

{{animation:incclose}}

In the workspace, **Close** and **Reopen** are buttons in the incident's header, shown when they
apply. [E04]

An incident is **Closed** when everyone agrees it's done. After that it can't be changed or
reopened.

- **Caller**: presses **Close** on a resolved incident in Employee Center when the fix works.
  [E01] [E11]
- **Team lead** (role `itil_admin`): you can close any resolved incident, and you're the only
  ones who see *Closed* in the state list. [E11] [E12]
- **Resolvers**: you can't close incidents, unless you're the incident's caller. Resolve it and
  let the caller confirm, or let it close by itself. [E11] [Q18]
- **Major incidents**: once accepted, only a major incident manager, or the caller if they have a
  role, can close it. [E11]
- **Automatically**: a resolved incident nobody touches is closed after **7 days**. [E03] [E06]

When it is closed, the caller gets an email *"Incident … was closed"* [E10] and a short survey.
[E08]

## Reopening

If the fix didn't work, a **resolved** incident can be reopened (not a major incident [E11]):

1. Open the incident and press **Reopen** in its header. [E04] [E02]
2. In the **Reopen** dialog, write in *Additional comments (Customer visible)* what is still
   wrong (required). [E05]
3. It goes back to **In Progress** for the same team. The resolution code and notes, and who
   resolved it and when, are cleared. [E07]

The caller can also reopen from Employee Center [E14], or by replying to the resolution email
with *please reopen* in the subject. [E09]

A **closed** incident can't be reopened. If the issue comes back, log a new incident and
mention the old number. (Replying *please reopen* to a closed incident's email does exactly that:
it creates a new incident. [E13])

## Canceling

If an incident was logged by mistake (a duplicate, a test), resolve it with the code
*Duplicate* and the parent incident (see [Resolve an incident](see:resolve)).

The state list also has *Canceled*, and nothing limits who may choose it: the write rules on the
state only stop changes once an incident is Closed or Canceled. Who may cancel isn't decided yet.
[Q19]
