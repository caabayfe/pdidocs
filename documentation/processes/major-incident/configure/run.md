---
title: The response - configuration
reviewed: 2026-10-17
evidence:
  E01:
    record: sys_ui_action/728d59a35f380300f51ca184ff4666b0
    how: read View Workbench
    result: roles itil, sn_incident_read; opens $major_incident_workbench.do
    hash: e18e648e017ae65ec45475f0be88dc81367d73b1de331e8cab40e610eb6096b5
  E02:
    record: sys_ux_form_action/9c5afbe753123010ae50ddeeff7b12e8
    how: read the workspace form action View Workbench
    result: inactive, although its layout item is active
    hash: e033d119525a90c1528c9a1d5d3f4d8be0f7195c76843afcf2c8cd15d276df24
  E03:
    record: sys_ui_page/7b4bd5635f380300f51ca184ff466650
    how: read the legacy workbench page
    result: the older workbench; the current one comes from sn_major_workbench, which isn't mirrored
    hash: da3cd1e44321d08c43e714efd51bba1422365a75cd429552aeb5683a46e11707
  E04:
    record: sys_app_module/20b5daf33b00030050bec9bb34efc42a
    how: read the Major Incidents menu
    result: roles itil, major_incident_manager, communication_manager, incident_manager, sn_incident_read
    hash: 70d0e85fd141c4dd22ee545cef555033c7a690713b8f925cd3e1e32b47d015cf
  E05:
    record: sys_user_role/8b88f99687480300b4ae6c5837cb0b08
    how: read major_incident_manager
    result: contains itil, ia_admin, comm_plan_manager, comm_plan_viewer
    hash: dd4494f284d69487b3e09192c4dfc3f6b03c618a8a44c073ca3828e287773a91
  E06:
    record: sys_properties/b928dda07754021024ad78dabd5a99d9
    field: value
    how: read sow_email_notification_redirect
    result: false
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## Roles

`major_incident_manager` contains `itil`, `ia_admin` and the communication plan roles. [E05] The
**Major Incidents** menu is visible to the service desk and the major incident roles. [E04]

## The workbench {label=OPEN-QUESTION}

**View Workbench** [E01] opens `$major_incident_workbench.do`. Its components come from the store
app *Major workbench components* (`sn_major_workbench`), whose records weren't read; the page read is
the older one. [E03] In the workspace, the *View Workbench* form action is inactive
[E02]. Email links open the classic workbench because SOW redirection is off. [E06] Check on
screen which workbench opens and what it shows.
