---
title: See what a change affects
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace, a normal change in New, Related records
    how: opened the change's Related records
    result: 'Affected CIs, Impacted Services/CIs, Approvers, Change Tasks, Problems, Task SLAs, Outages'
  E02:
    record: sys_ui_related_list/4caebd7cb7330010dff9fa13ee11a9e9
    children: sys_ui_related_list_entry
    how: read the change request's related lists (Default view)
    result: 'Affected CIs (task_ci) first, then Impacted Services/CIs (task_cmdb_ci_service) and impacted service offerings (task_service_offering); Outages (task_outage) last'
    hash: 548c328822eae72b075679d69b9951be3700fee9a27b6b232664ad2339f8dc21
  E03:
    record: sys_declarative_action_assignment/d8b16452439e42102e5e1febb7b8f26d
    how: read CI dependency view (sn_sow_itsm_common)
    result: 'a button with a tree icon beside the Configuration item field of any task, changes included, shown when the field has a value; tooltip "Configuration item dependency view"; no role required'
    hash: 89f5400674d4eb93b56dbc428aaa3c5300bfa2bb88a2a7bfe0ed309b7b96358a
  E04:
    record: sys_declarative_action_assignment/5de0705e439e42102e5e1febb7b8f23f
    how: read Service dependency view (sn_sow_itsm_common)
    result: the same button beside the Service field, when it has a value; no role required
    hash: 05805ffb16bde6df2513fc95b706f9aff7a09c28c906d220c22986c78d5e5781
  E05:
    record: sys_declarative_action_assignment/e5219cd8432202102e5e1febb7b8f2b1
    how: read Service offering dependency view (sn_sow_itsm_common)
    result: the same button beside the Service offering field, when it has a value; no role required
    hash: 28a8c082d44de4b431a0a3e00c44b209f6bc2eecb7efc1f14cc3eb7e13129b14
  E06:
    record: sys_declarative_action_payload_definition/2daa3908f8156a10f8775f2783e9b7e8
    field: payload_template
    how: read Open CI dependency view
    result: 'opens the Map page in a new workspace tab titled "Map", centred on the CI, five levels deep'
    hash: c5b61f58eaad61f0a6ae0a2a4cda07fb73d89147f17e0c1db50692994cbc42bb
  E07:
    record: sys_ux_macroponent/50182083770d9110960ced43ba5a99a4
    field: required_translations
    how: read the labels of the CMDB Unified Map page
    result: 'Add to map, Open in new map, Apply filters, Preset, Attributes, Related items; also Create or change connection and Delete connection ("Deleting this connection might result in an invalid CMDB state. This action might affect service instances.")'
    hash: df67e18a15ad6accf28c0fbccd246498e2bf62831565cf09826f5af2b585ee74
  E08:
    record: sys_script/6f8daf204a3623120146c79f308310df
    field: script
    how: read Sync CI with Affected CIs (after insert and update on task, when the CI changes)
    result: the change's CI is added to Affected CIs; when the CI is changed, the old one is removed
    hash: 75404bfd298fb51c68a4ccf3ecb43d59b2300738f5c3140db75bedcff9e6ca04
  E09:
    record: sys_script/429f991b0b323200ed45478d83673ac5
    field: script
    how: read Sync BS with Impacted Services (incident, problem, change)
    result: the change's Service is added to Impacted Services/CIs; when it is changed, the old one is removed
    hash: 3ea8adcb1badaeb1abb97de5ba5d558f06e58aa1d9beb12b8b176b676be3aa7c
  E10:
    record: sys_declarative_action_assignment/fe3d9a487331301045216238edf6a7ff
    field: script_condition
    how: read Add on Affected CIs in the Service Operations Workspace (sn_sow_itsm_common)
    result: 'shown while the change is active, when change_request is listed in com.snc.task.associate_ci, and when ChangeProposed says CIs can be added'
    hash: 1f90237ce5705001975ec2f236bd366b1441125d65534d3153ff3705871457b5
  E11:
    record: sys_script_include/c4d9924deb1102002a7a666cd206fedf
    field: script
    how: read ChangeRequestSNC.canModifyCI, which ChangeProposed.canAddCI calls
    result: a change's CIs can be changed in its first state (New), or in the states its change model marks Allow CI Modification
    hash: ede70ae25eb3b18ec219e2dee8905b653bb7683b641757eb0c8d8dfb44e74921
  E12:
    record: sys_declarative_action_payload_definition/d46c98047321301045216238edf6a7c7
    field: payload_template
    how: read Task CI MRA, the client action of Add
    result: 'Add opens a picker of configuration items, filterable by Configuration Class'
    hash: 8d4694c29123a025718fb6db49057c1e3668dcde6ab79ae1a96f7c2d3715fcdc
  E13:
    record: sys_script/dba9c3abff6431107f54ffffffffff86
    field: script
    how: 'read Change Model: Read only CI (Insert), on task_ci'
    result: '"Affected CIs cannot be modified for Change Requests in this state. CI: {0} not associated"'
    hash: efc3b20c97ec6f9393127d8dd7272f01fe777a15c302adb197407d041c83ad2d
  E14:
    record: sys_script/fddaef16ffa40210bb76ffffffffffbc
    field: script
    how: 'read Change Model: Read only CI (Delete), on task_ci'
    result: '"Affected CIs cannot be modified for Change Requests in this state. CI: {0} not removed"'
    hash: bb2d71b2b3ab4a47977e111295ad74c7f5a19bf776f1f03bd9ecd706c068725e
  E15:
    record: sys_declarative_action_assignment/702ede887371301045216238edf6a7d3
    field: server_script
    how: read Remove on Affected CIs in the Service Operations Workspace (sn_sow_itsm_common)
    result: '"A task''s primary CI cannot be removed from Affected CIs - change or remove the CI from the task form instead"; other rows: "Affected CI {0} is removed successfully"'
    hash: a863ecbc448bde5fe52b4d28512e80e309ee6b513e351331c8090e67f94b4803
  E16:
    record: sys_ui_action/77688cfe6f35f100e5f2b3312e3ee4e6
    field: script
    how: read Add on the classic form's Affected CIs list
    result: 'opens a dialog "Add Affected CIs"; same conditions as the workspace Add'
    hash: c293a267f0f94a904ef7b0617ef777fd9195afc17cb259e2bb6379b0f2cb902c
  E17:
    record: sys_script/08cf6ffe23203300a5eedc1756bf657f
    how: read Refresh Impacted Services (after insert and update on change_request)
    result: rebuilds the impacted services when the change leaves New, or is created past New
    hash: f14bef4c1468e1422361c5bf2e3c05bf3a5b7c7b9d270649187246368b5fd086
  E18:
    record: sys_properties/357e737623d023001488dc1756bf65fb
    field: value
    how: read com.snc.change_request.refresh_impacted.include_affected_cis
    result: "true: on a change, the refresh starts from every affected CI, not only the change's CI"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E19:
    record: sys_script_include/2ddf83eb9fa331002920bde8132e7044
    field: script
    how: read ChangeUtilsSNC.getImpactedServicesFromAffectedCIs and _addAdditionalServices
    result: 'removes the impacted services not added by hand, adds the services the affected CIs belong to and those of CIs with scheduling conflicts, then "Refresh impacted services for change request {0} has completed"'
    hash: 8d79e81d45091a1e51f81a7578d8b2f66ce9b2bb56ad85c61251f6616927eca8
  E20:
    record: sys_dictionary/6b32727f8c9103100a22deb6dd2b4e24
    how: read task_cmdb_ci_service.manually_added
    result: "default true: a service added by hand, or by the change's Service field, counts as added by hand and stays"
    hash: 62387660a7373dfc68d1d22b8f3d3e336dab039321df5fbde25cbd1aaf777653
  E21:
    record: sys_ui_action/baae03f0673303006e6eadab9485ef14
    how: read Refresh Impacted Services (change_request, classic form context menu)
    result: saves the change and starts the same refresh; shown only when change_request is listed in com.snc.task.refresh_impacted_services
    hash: 2911746a8754c9f4c9fac77605b08a6f0176aa169aeec85580a98865ded0cb18
  E22:
    record: sys_ui_action/3df20057c3122200b6dcdfdc64d3aed1
    field: script
    how: read Create Outage (change_request, classic form context menu)
    result: "saves the change and opens a new outage with the change's CI, number and short description filled in; roles itil and sn_change_write"
    hash: 11b01fa8735fbc233e9883b6c9d9a881d076b3d00175eb88692e29e719758b2c
  E23:
    record: sys_declarative_action_assignment/77291ca1a3320210ebb11e3f26fcdad6
    how: read Create outage (sn_sow_inc, Outages list, Service Operations Workspace)
    result: opens a new outage record (cmdb_ci_outage); no condition and no role
    hash: 1292783c440ea0b09b645cc11430b14b16bc0403277f44552c4535a3f3df46ae
  E24:
    record: sys_declarative_action_assignment/ba87ed99eb46301080de83402a522862
    how: read Add on the Outages list (sn_sow_itsm_common)
    result: links an existing outage to the task; no condition and no role (Remove the same)
    hash: d979e2d0a1dcba8c43cdd0f692a7b8571d30e73dc4f62a000f2dc433cea9b0bd
  E25:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace, a normal change in New, header
    how: opened More actions
    result: 'Compose Email, Delete (no Create Outage)'
  E26:
    record: sysevent_email_action/8e0a46fa0a0a0286002d78c0934d827c
    how: read CI affected
    result: the only notification for CI subscribers, and it is on incident; nobody subscribed to a CI is emailed about a change
    hash: 42e869520ab18888b59f30ba6e7bcc7a19a431202840130782f409c14a8d42d5
---
## When to use it {label=NEW}

A change names a **Configuration item**, often a **Service** and a **Service offering**. Before
you ask for approval, and when you approve, look at what else depends on them: the risk, the
window and the approvers all follow from it.

| You are | Use it to |
|---|---|
| the change requester | keep **Affected CIs** complete while the change is in *New*, so the impacted services and the conflict check are right |
| a technical approver | check that the affected and impacted lists match the plans before you approve (see [Approve as a technical approver](see:review-approval)) |
| a CAB member | see which services the change hits, and how far, before the board decides (see [The change advisory board](see:cab)) |

The lists are on the change's **Related records**: **Affected CIs**, **Impacted Services/CIs** and
**Outages**. [E01] [E02] The same views on an incident are in
[See what the incident's configuration item affects](see:incident/see-impact); the CMDB side is in
[See what depends on a configuration item](see:cmdb/impact).

## Open the dependency view {label=NEW}

{{animation:chgimpact}}

1. Open the change in the Service Operations Workspace and fill **Configuration item** (or
   **Service**, or **Service offering**).
2. Choose the tree icon beside the field: **CI dependency view**, **Service dependency view** or
   **Service offering dependency view**. It appears only when the field has a value, and needs no
   special role. [E03] [E04] [E05]
3. A **Map** tab opens, centred on that item, with five levels of connections around it. [E06] [Q28]
4. Use **Apply filters** to narrow the CIs, **Open in new map** to centre on another CI, and
   **Related items** or **Attributes** to read a selected one. [E07]

The map can also create and delete connections, and warns that deleting one "might result in an
invalid CMDB state". [E07] Don't change the CMDB from a change's map: what the change will alter
is planned in the change itself. [Q08]

## Keep Affected CIs complete {label=NEW}

- The change's own **Configuration item** is added to **Affected CIs** for you, and replaced when
  you change the field. [E08]
- Its **Service** is added to **Impacted Services/CIs** in the same way. [E09]

To add more, choose **Add** on **Affected CIs** and pick configuration items; filter by
**Configuration Class** to find them faster. [E10] [E12] On the classic form, **Add** opens the
*Add Affected CIs* dialog. [E16] **Remove** takes rows away, except the change's own CI: change
the field on the form instead. [E15]

**Do it while the change is in New.** After that, Add is hidden, and a change that follows a
change model refuses to add or remove: *"Affected CIs cannot be modified for Change Requests in
this state"*. [E10] [E11] [E13] [E14] A model can allow it in later states; ask the change manager
if you need to. [E11] [Q19] Add and Remove also appear only if the platform team lists changes in
`com.snc.task.associate_ci`. [E10] [Q17]

## Impacted services are worked out for you {label=NEW}

When the change leaves *New* (when you request approval, for a normal change), the impacted
services are rebuilt in the background from **every affected CI**, not only the change's own CI.
[E17] [E18] The refresh:

- removes the services it added before, and keeps those you added by hand or that came from the
  **Service** field [E19] [E20];
- adds the services the affected CIs belong to, and the services of CIs with scheduling
  conflicts [E19] [Q20];
- tells you when it is done: *"Refresh impacted services for change request CHG… has
  completed"*. [E19] [Q29]

So an affected CI added after *New* doesn't reach the impacted services. On the classic form,
**Refresh Impacted Services** in the form menu runs the refresh again, where the platform team
has switched it on. [E21] [Q17]

## Record an outage {label=NEW}

If the work takes a service down, record it on **Outages**: in the workspace, **Create outage**
opens a new outage, and **Add** links one that exists. [E23] [E24] The workspace's **More
actions** menu doesn't offer it. [E25] On the classic form, **Create Outage** in the form menu
fills in the change's CI, number and short description (for `itil` and `sn_change_write`). [E22]

## Who is told {label=NEW}

Nobody, from these lists: people subscribed to a CI are emailed only about incidents, not about
changes. [E26] If the service's users need to know, tell them yourself.

## Tips

- Set the CI before you open the view: the button isn't there while the field is empty. [E03]
- Add every CI the plans touch before you request approval: the impacted services, and so the
  approvers' and CAB's view, are built from them. [E17] [E18]
- As an approver, if a CI from the implementation plan is missing from **Affected CIs**, reject
  with that question: the change has to go back to *New* to fix it. [E11]
