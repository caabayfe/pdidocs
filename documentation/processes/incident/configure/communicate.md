---
title: Communication plans - configuration
reviewed: 2026-10-18
evidence:
  E01:
    record: sys_script/1953a23e5b3b0300e3cc8e6541f91a3a
    how: read Attach Communication plans (on task, async_always)
    result: runs only when CommunicationPlanEngine(current).canRun() is true, then attaches the plans whose definitions match
    hash: 4a8f6848ad44425f448e3a3824d4933f83861a5a639a3a0e0afa6a9eb6870570
  E02:
    record: sys_script_include/3048c6b65b3b0300e3cc8e6541f91aaf
    field: script
    how: read CommunicationPlanEngineSNC canRun
    result: true only when an active, condition-based plan definition exists for the record's table
    hash: 0d752c2db8031d0ae72e7607d4ab79847061c83e13a0f1c2bbca85266ae253f5
  E03:
    seen:
      by: 'Claude (snagentic session, signed in as admin)'
      on: 2026-10-17
      where: 'Communication Plan Definitions list, table incident'
    how: 'opened the list'
    result: 'No records to display'
  E04:
    record: sys_declarative_action_assignment/a8b7c3f0a37002101509d63f26fcda17
    how: read Open new communication modal
    result: table incident, record condition active=true, script condition com.snc.iam active, itil (or sn_incident_read with com.snc.itsm.roles) and ia_admin; no major incident condition
    hash: 85bd83856a161f7151e0b354051dfa9542e5e1c5b9146ecf365732b6c48190e9
  E05:
    record: sys_ux_form_action_layout_item/90f84734a37002101509d63f26fcda6c
    how: read the workspace header item
    result: 'Create new communication, overflow menu, order 1200'
    hash: c0e30936377e4622d6351c5c4bf377f5d9c6a1d81b9875f089e864819d22555b
  E06:
    seen:
      by: 'Documentation agent, as admin'
      on: 2026-10-18
      where: 'Service Operations Workspace, incident, header'
    how: 'opened More actions'
    result: 'Create new communication is listed'
  E07:
    record: sys_user_role/c23366ebdcac010059921d929b232e98
    how: read ia_admin
    result: Incident Communication Plan Admin, full access to the application
    hash: 0acf623b1d26cea68c56f3c5b208df654c896d3ee500db8b5281758d316aa6d8
  E08:
    record: sys_user_role_contains/57c31b815fc91300ff67a184ff46669f
    how: read incident_manager contains ia_admin
    result: incident managers hold ia_admin
    hash: adc49b35191098c83559ec7c3ef8dc2800031729645062949069668e24ad5d52
  E09:
    record: sys_user_role_contains/5484f9f5c34103009f93dfdc64d3ae74
    how: read major_incident_manager contains ia_admin
    result: major incident managers hold ia_admin
    hash: 849effef0e1fd8b229ea018434a87571525559636239ca70e8fc61eb323dd84c
  E10:
    record: sys_user_role_contains/08a43df5c34103009f93dfdc64d3ae0e
    how: read communication_manager contains ia_admin
    result: communication managers hold ia_admin
    hash: 4ce4db373a357b48f4e4caa660dbca9fd8575b8139ead2037c6386982ebc985b
  E11:
    record: sys_user_role_contains/a9d5acf8933722107499b27a7bba100c
    how: read sn_iam_admin contains ia_admin
    result: the communication admin role holds ia_admin
    hash: 77cbc7830164f3272295e73a6a081ce4d7391b85490e96d7fdcaeac7aee9e659
  E12:
    record: sys_user_role_contains/c3e13d4e872013005087af1e36cb0b8b
    how: read ia_admin contains comm_plan_manager
    result: ia_admin brings the right to create plans and tasks
    hash: e34e69cdb66ea8b239a22a2a7fb70bfc1a34c804e7befa9076c89782e70deb2a
  E13:
    record: sys_security_acl/bdcc063b53330300fc91ddeeff7b12a1
    how: read comm_plan create
    result: comm_plan_admin or comm_plan_manager
    hash: cd2da81ffecebfb84fbe7a07dba62f8d0f2d5fd150d65f06fa03bf3fdda06789
  E14:
    record: sys_security_acl/0eee067b53330300fc91ddeeff7b129e
    how: read comm_task create
    result: comm_plan_admin or comm_plan_manager
    hash: 94dd34131d103ef96360b36e40cb8a0ff77362b26277ba1a6eebe57a206907ab
  E15:
    record: sys_security_acl/11fc463b53330300fc91ddeeff7b12b6
    how: read comm_plan read
    result: comm_plan_viewer, comm_plan_manager or comm_plan_admin
    hash: 6def559320d3505845ca3065efa67853c54705077a060cbb26c36d8b6893b81f
  E16:
    record: sys_user_role_contains/0dd4329e3b481300ad3cc9bb34efc469
    how: read itil contains comm_plan_viewer
    result: every itil user can read plans
    hash: bb1640c43292805cc2d6867731fddecce8df0c5899183e69b33c615a555ceff7
  E17:
    record: sys_ws_operation/8131cd1d5fd013006ae6a184ff46669e
    field: operation_script
    how: read adhoc_comm_plan (POST /api/sn_comm_management/task_communication_management/adhoc/comm_plan)
    result: needs a short description and a frequency; hands the incident to the handler for its table
    hash: 59cf15c2d5faaadec8835cefd4a54f7402bca952842b4161de8c2bee73edbdbf
  E18:
    record: comm_task_handler/11febb5f5308130009170ef5d5dc34aa
    how: read the handler for table incident
    result: plans go to incident_alert, tasks to incident_alert_task, through CommunicationManagementIncidentHandler
    hash: 8d59c8bc8ed38a1676044dc2e57ace2e5032963fb6019e8cd80638b3ce73f283
  E19:
    record: sys_script_include/09b5281f533b030009170ef5d5dc344c
    field: script
    how: read CommunicationManagementDefaultHandlerSNC createAdhocCommPlan, prepareAdhocCommTaskGr, calculateNextDue
    result: refuses without create rights; sets the plan's short description, type and source and the task's frequency and due in; a recurring task's next due date is the last communication plus due in
    hash: 198cca1968aed1e653fddaf7ffdc3d3c8ff8d75cdfccd4b6b139fb882b9a0b63
  E20:
    record: sys_dictionary/0e459a4b83f78310292aca75eeaad3b3
    how: read comm_plan.assigned_to
    result: defaults to the user who creates the plan
    hash: c110fbb6b1fa104abe337fe84d3e0b82c7d586a28fa77ffb825a799dfc2d3931
  E21:
    record: sys_script/a433f9d553701300d6fdddeeff7b121b
    how: read Auto Assignment of ICP
    result: a plan on an accepted major incident inherits its group and assignee
    hash: d01f7d466a3d4476abb961f68e0e7ab70065c31adf1129b15a5974e1414e3e7f
  E22:
    record: sys_script/87d6f91953701300d6fdddeeff7b1297
    how: read Auto Assignment of ICT
    result: tasks without a group take the plan's group and assignee, only when the incident's major incident state is accepted
    hash: b91bde9469af991ea0a9fe85b4f29d3a2bc4b0b9295b334d7387f8f9f1a2a477
  E23:
    record: sys_ux_client_script/7291f38d53ad71109194ddeeff7b1227
    field: script
    how: read build channels choice list
    result: offers only available channels, never a bridge (conference)
    hash: 9aa807969f15fee6448339ae6ca0bb07fc44a515b48497fd51ac2457768d6b05
  E24:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E25:
    record: sys_script_include/1d5e72985310130009170ef5d5dc343b
    field: script
    how: read CommunicationManagementChannelSmsConfigSNC
    result: SMS is available only when Notify is enabled or a Notify number is set
    hash: 3c7affa4cdb665a13801725f421ecc37f2ab13bf31007f62a6dc19ca2a33ca88
  E26:
    record: sys_properties/f4202de587dea110de52a64d0ebb35c3
    field: value
    how: read com.snc.iam.default_email_recipient_field
    result: bcc
    hash: a9b8efc5a481ac393e6fad94441247d18cc508a740ea59b83fc31cae7db4eb48
  E27:
    record: sysevent_register/320d4b7d5be81300e3cc8e6541f91a44
    how: read incident_alert_task.complete.75
    result: on task_sla, fired by "Incident communication task SLA", reminder that the communication is due
    hash: 6e409404d7b7dbcfd57c4593d09dc1f0db45c88c2df611239c7522ac7459e14b
  E28:
    record: sysevent_email_action/013a8f3d5be81300e3cc8e6541f91ae1
    how: read Communication Due Warning
    result: event incident_alert_task.complete.75, to task.assigned_to
    hash: 86bd37039bea064f5dbbcab73588c27a1309d936fc9b30099e478b54e8160221
  E29:
    record: sysevent_email_action/69ca5cac5b701300e3cc8e6541f91a10
    how: read Communication Overdue
    result: event incident_alert_task.breached, to task.assigned_to
    hash: c9e6132c1a7fa97009beabf179b382649f86403e10af955ffbe84ed313518646
  E30:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    children: sys_ui_related_list_entry
    how: read the related lists of the workspace incident view
    result: incident_alert.source at position 13
    hash: 1dc5e75dcb9cb55b773b0992baca4499230041ea4b78c3d3db3162b600bf30b5
  E31:
    seen:
      by: 'Documentation agent, as admin'
      on: 2026-10-18
      where: 'Service Operations Workspace, incident, Related records tab'
    how: 'read the related lists'
    result: 'Incident Communication Plans is listed'
  E32:
    record: sys_declarative_action_assignment/d45cc516a3810210ebb11e3f26fcdaba
    how: read New (table incident_alert, workspace view)
    result: a New action on the plans related list, with no role of its own
    hash: cf049bb44d7ecca884a8606e72c697e094251f39f5ed63288e7a6070d012bfe5
  E33:
    record: sys_properties/5aefbb67871b030055c9d61e36cb0bc6
    field: value
    how: read com.snc.incident.incident_alert.closure
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E34:
    record: sys_script/2f5b84f7871b030055c9d61e36cb0b14
    how: read Cascade Closure of ICPs (incident, after, state changes to Closed or Canceled)
    result: cancels or closes the incident's plans, only when com.snc.incident.incident_alert.closure is true
    hash: 4dc96279613f0dbaccecbf65d8d1b4ae93484aaca8394e8f4520967d95406f6b
  E35:
    record: sys_properties/193f6d2e530303006725ddeeff7b1205
    field: value
    how: read com.snc.iam.incident_alert_task.closure
    result: false, so closing a plan doesn't close its open tasks
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
This page covers communication plans on any incident. The major incident pages
([Communicate](see:major-incident/communicate)) cover the same records from the major incident
side and list the email templates.

## 1. Plans by definition {label=NEW}

The async rule *Attach Communication plans* runs on every task save but acts only when an active,
condition-based plan definition exists for the table. [E01] [E02] There is none for incidents
[E03], so no plan attaches by itself, on an ordinary or a major incident.

## 2. Who is offered the action {label=NEW}

*Open new communication modal* is assigned to the incident table in the workspace, for **any
active incident**: it has no major incident condition. [E04] It shows as **Create new
communication** in the header's overflow menu [E05] [E06], for users with `itil` (or
`sn_incident_read`) and `ia_admin`. [E04]

| Role | Has `ia_admin` | Evidence |
|---|---|---|
| `incident_manager` | yes | [E08] |
| `major_incident_manager` | yes | [E09] |
| `communication_manager` | yes | [E10] |
| `sn_iam_admin` | yes | [E11] |
| `itil` | no; reads plans only, through `comm_plan_viewer` | [E16] |

`ia_admin` is the communication plan admin role [E07]; it contains `comm_plan_manager` [E12],
which the create ACLs on plans and tasks require. [E13] [E14] Reading plans needs
`comm_plan_viewer` or above. [E15]

## 3. Creating the plan and task {label=NEW}

The dialog posts to the `adhoc_comm_plan` operation, which needs a short description and a
frequency and passes the incident to the handler for its table [E17]: for `incident`, plans go to
`incident_alert` and tasks to `incident_alert_task`. [E18] The handler refuses users without
create rights, then sets the plan's short description, type and source, and the task's frequency
and due time. [E19] The plan's assignee defaults to its creator. [E20]

On an **accepted major incident** only, plans take the incident's group and assignee [E21] and
tasks take the plan's [E22]; on an ordinary incident, the task has no assignee unless someone sets
one.

## 4. Channels {label=NEW}

The dialog lists only available channels, never a conference bridge. [E23] Notify is off [E24],
and SMS needs Notify or a Notify number [E25], so email is the only channel. Email recipients go
to blind copy. [E26]

## 5. Due dates and reminders {label=NEW}

A recurring task's next due date is its last communication plus *Due in*. [E19] The events
`incident_alert_task.complete.75` and `incident_alert_task.breached` are raised on `task_sla` by
the *Incident communication task SLA* [E27], and send *Communication Due Warning* and
*Communication Overdue* to the **task's assignee** only. [E28] [E29]

## 6. On the incident form {label=NEW}

The workspace incident view lists the plans as *Incident Communication Plans* (related list
`incident_alert.source`) under **Related records**. [E30] [E31] The list has a *New* action with no
role of its own, so the create ACLs decide who can use it. [E32] [E13]

## 7. Closing {label=NEW}

*Cascade Closure of ICPs* would close or cancel an incident's plans when the incident is closed or
canceled, but only when `com.snc.incident.incident_alert.closure` is true; it is false. [E33] [E34]
Closing a plan doesn't close its open tasks either. [E35]

## Open questions {label=OPEN-QUESTION}

- Is the *Incident communication task SLA* that raises the due and overdue events active on pdi2?
  Its SLA definition isn't in the mirror. [E27]
- Should a communication task on an ordinary incident get an assignee automatically, so that the
  due and overdue reminders reach someone? Today only accepted major incidents copy it. [E22]
- Should service desk agents or team leads (`itil`, `itil_admin`) be able to create communications
  on ordinary incidents, or is it right that only incident, major incident and communication
  managers can? [E04]
- Should closing an incident close its communication plans (`com.snc.incident.incident_alert.closure`)?
  [E33]
