---
title: Close, reopen or cancel an incident
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/bbddb6bbc0a8016400c56236de22441a
    how: read the Close button
    result: available only for Resolved incidents, to the caller and to team leads
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
---
## Closing

In the workspace, **Close** and **Reopen** are buttons in the incident's header, shown when they
apply. [E04]

An incident is **Closed** when everyone agrees it's done. After that it can't be changed or
reopened.

- **Caller**: presses **Close** on a resolved incident in Employee Center when the fix works.
  [E01]
- **Team lead**: you can close any resolved incident, and you're the only ones who can choose
  *Closed* in the state list. [E01]
- **Resolvers**: you can't close another person's incident. Resolve it and let the caller confirm.
- **Automatically**: a resolved incident nobody touches is closed after **7 days**. [E03] [E06]

When it is closed, the caller gets an email and may receive a short survey.

## Reopening

If the fix didn't work, a **resolved** incident can be reopened:

1. Open the incident and press **Reopen** in its header. [E04] [E02]
2. In the **Reopen** dialog, write in *Additional comments (Customer visible)* what is still
   wrong (required). [E05]
3. It goes back to **In Progress** for the same team. The resolution fields are cleared.

The caller can also reopen from the portal, or by replying to the resolution email with
*please reopen* in the subject.

A **closed** incident can't be reopened. If the issue comes back, log a new incident and
mention the old number. (Replying *please reopen* to a closed incident's email does exactly that:
it creates a new incident.)

## Canceling

If an incident was logged by mistake (a duplicate, a test), resolve it with the code
*Duplicate*, or set it to *Canceled* if your role allows it.
