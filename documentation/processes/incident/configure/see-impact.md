---
title: Dependency views and impact lists - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: sys_declarative_action_assignment/d8b16452439e42102e5e1febb7b8f26d
    how: read CI dependency view
    result: 'field action on task.cmdb_ci, view Service Operations Workspace, model condition valueISNOTEMPTY, client action Open CI dependency view, no required roles'
    hash: 89f5400674d4eb93b56dbc428aaa3c5300bfa2bb88a2a7bfe0ed309b7b96358a
  E02:
    record: sys_declarative_action_assignment/5de0705e439e42102e5e1febb7b8f23f
    how: read Service dependency view
    result: field action on task.business_service, same conditions
    hash: 05805ffb16bde6df2513fc95b706f9aff7a09c28c906d220c22986c78d5e5781
  E03:
    record: sys_declarative_action_assignment/e5219cd8432202102e5e1febb7b8f2b1
    how: read Service offering dependency view
    result: field action on task.service_offering, same conditions
    hash: 28a8c082d44de4b431a0a3e00c44b209f6bc2eecb7efc1f14cc3eb7e13129b14
  E04:
    record: sys_declarative_action_payload_definition/2daa3908f8156a10f8775f2783e9b7e8
    field: payload_template
    how: read Open CI dependency view
    result: 'route unifiedmap in the current workspace, rootNode = the field value, selectedNodeClass cmdb_ci, levels 5'
    hash: c5b61f58eaad61f0a6ae0a2a4cda07fb73d89147f17e0c1db50692994cbc42bb
  E05:
    record: sys_declarative_action_payload_definition/adffb403e8916610f8774c5c4b21d471
    field: payload_template
    how: read Open Service dependency view
    result: the same with selectedNodeClass cmdb_ci_service
    hash: ebdbf16712065d759ea01fac790c8324867f495936201defa1901fea062be380
  E06:
    record: sys_declarative_action_payload_definition/c1b34547e8916610f8774c5c4b21d497
    field: payload_template
    how: read Open Service Offering dependency view
    result: the same with selectedNodeClass service_offering
    hash: 27fe2498d0bdfb19309d7ffe7c95a278dfb039bc697baef78b817107e4c876d5
  E07:
    record: sys_ux_addon_event_mapping/055d790cf8156a10f8775f2783e9b7d9
    how: read SOW Open dependency view (sn_sow_itsm_common), and its twins in sn_sow_inc
    result: active; the field action's event opens the route; sn_sow_inc adds its own mappings for the same three actions
    hash: 571069e38c6eef0ecfac9c9d3d6561e7680d6743c6af5561afba99ce971d7b6c
  E08:
    record: sys_ux_app_route/518e5a48f8d56a10f8775f2783e9b748
    how: read Map (Service Operations Workspace)
    result: 'route unifiedmap, field rootNode, optional selectedNodeSysid, selectedNodeClass, selectedConnectionId, levels, presetId'
    hash: 23242da376b338da5be12f83e43b9bd1af3e56edd3cced60f8a451b6da8a7642
  E09:
    record: sys_ux_screen/dd8e5a48f8d56a10f8775f2783e9b751
    how: read Unified Map Default
    result: active; renders the macroponent CMDB Unified Map of the CMDB Workspace (sn_cmdb_ws)
    hash: 8939263c09f53dee1eda173144339c0fdb5bbdd4139b7ebce1c8869cd62b06ae
  E10:
    record: sys_properties/f1f9c2fed72111005e8da3eb5e61037e
    field: value
    how: read glide.bsm.max_levels
    result: "3: the classic dependency view's depth; the workspace map asks for 5 levels itself"
    hash: 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce
  E11:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    how: read Incident - Service Operations Workspace related lists (sn_sow_inc)
    result: 'task_sla, task_ci, task_cmdb_ci_service, incident_task, child incidents, …, task_outage, …, task_location'
    hash: 73b1913c826b56fe758873726968b365bd03b5c7b29643ed2b24831c520ea8ba
  E12:
    record: sys_ux_client_script/725abcff77523010012f06e57b5a99db
    field: script
    how: read Set Impact Related lists (Incident Overview)
    result: 'impact cards task_ci.task and task_cmdb_ci_service.task in view sow_incident_overview, and Assets: task_ci.task with ci_item.asset!=NULL in view sow_incident_overview_asset'
    hash: fa1dac3cdb8f5fa7ff29cb44a35e55269538dba1a8281805cac16e006e263a4c
  E13:
    record: sys_declarative_action_assignment/fe3d9a487331301045216238edf6a7ff
    field: script_condition
    how: read SOW task CI add (sn_sow_itsm_common, view sow)
    result: "parent.active, the parent's class listed in com.snc.task.associate_ci, and ChangeProposed.canAddCI"
    hash: 1f90237ce5705001975ec2f236bd366b1441125d65534d3153ff3705871457b5
  E14:
    record: sys_declarative_action_assignment/702ede887371301045216238edf6a7d3
    field: script_condition
    how: read SOW task CI remove (sn_sow_itsm_common, view sow)
    result: parent.active and the class listed in com.snc.task.associate_ci; refuses to remove the task's primary CI
    hash: 93fffe7575ba9411ede2b37a53d33d43b8e6cd2aab6e786460fdd9a626b39871
  E15:
    record: sys_declarative_action_assignment/0f86af9873f9301045216238edf6a796
    field: script_condition
    how: read SOW task cmdb ci service add (sn_sow_itsm_common, view sow), and its Remove 1ce6a7d873f9301045216238edf6a70e
    result: parent.active and the table listed in com.snc.task.associate_ci
    hash: 0df2baa26d09ad3ef0b3ee54960149af4c39fe3885df364eb9fa58b40620ce38
  E16:
    record: sys_properties/0abd8ea1931331003b7a7a75e57ffbd9
    how: read com.snc.task.associate_ci
    result: 'task types whose CIs are associated through a list; read and write role sn_change_admin; the value is redacted in the mirror'
    hash: f1613b1e1513ea90548144a143f027c44bf725cf4ac71160d6ef7ea49de9f812
  E17:
    record: sys_declarative_action_assignment/c46bdcc07321301045216238edf6a7ba
    how: read task CI add (sn_sow_inc, view sow_incident_overview)
    result: condition parent.active only; client action Task CI MRA
    hash: 1b45740efc25873adc72e6fb0c3de4410545e5187b0a7779b5e3a5d07d0bfa4f
  E18:
    record: sys_declarative_action_assignment/d805f3c07321301045216238edf6a7ff
    how: read task cmdb ci service add (sn_sow_inc, view sow_incident_overview)
    result: condition parent.active only; client action Impacted Service MRA
    hash: 90f82ef19e4c4185ddcd6e462f550616fdbb33504dbcf35cf1f7345e812555dc
  E19:
    record: sys_declarative_action_assignment/ed88bf447321301045216238edf6a705
    field: server_script
    how: read task CI remove (sn_sow_inc, view sow_incident_overview)
    result: condition parent.active; keeps the primary CI with an info message, deletes other rows
    hash: 8e93e259e83475e32de1c836c55919f3f84bc4cb3237b82757a6779e896360a0
  E20:
    record: sys_declarative_action_assignment/fef4dd9473a1301045216238edf6a7a9
    field: server_script
    how: read impacted CI remove (sn_sow_inc, view sow_incident_overview)
    result: condition parent.active; deletes the selected rows
    hash: 2ff94fb890e12ecca85bd4a0b70efa757161c96d467f119e3a74aefba64c11d0
  E21:
    record: sys_declarative_action_payload_definition/d46c98047321301045216238edf6a7c7
    field: payload_template
    how: read Task CI MRA
    result: 'm2m picker on cmdb_ci (extension point CMDB_CI_QUERY_FILTER), reference filter on Configuration Class, asynchronous above 50 rows'
    hash: 8d4694c29123a025718fb6db49057c1e3668dcde6ab79ae1a96f7c2d3715fcdc
  E22:
    record: sys_declarative_action_payload_definition/85277f047321301045216238edf6a7d5
    field: payload_template
    how: read Impacted Service MRA
    result: the same picker, writing task_cmdb_ci_service.cmdb_ci_service
    hash: f6f508a31424d2ffc237c7ea978bd44fd810de17aaef7323451e697cc8f97012
  E23:
    record: sys_declarative_action_assignment/606dd806531001100999ddeeff7b124c
    how: read Refresh impacted services (sn_sow_inc, task_cmdb_ci_service, view sow_incident_overview)
    result: 'required roles itil, sn_incident_write; condition CIUtils.canShowRefreshServicesUIAction(parent.sys_class_name)'
    hash: 868fdcf3046e5fa753b8a65faa442bfa6a67691098b17002499bb265b1f0afe0
  E24:
    record: sys_ui_action/807e83d1878010100e3dd61e36cb0b89
    field: script
    how: read Refresh Impacted Services (incident, form context menu)
    result: the classic form's equivalent; saves the incident and calls TaskUtils.triggerRefreshImpactedServices
    hash: ca07ef850dd601dbbd497a5cf33ffbb9a83c305bb1010d877cc18908c49e766c
  E25:
    record: sys_script_include/c93a87d20a0a0b1d0196af61b0ca8db5
    field: script
    how: read CIUtils (canShowRefreshServicesUIAction, refreshImpactedServices)
    result: the action shows for the task classes listed in com.snc.task.refresh_impacted_services; the refresh deletes rows with manually_added false and inserts servicesAffectedByCI(cmdb_ci), skipping manual ones
    hash: d0ffe3a4077a604252a5612b8e3c35150410e6b62b0b3444edcbd8ba1ffeec31
  E26:
    record: sys_properties/eee3f4c2531203006725ddeeff7b1286
    how: read com.snc.task.refresh_impacted_services
    result: read and write role sn_cmdb_admin; the value is redacted in the mirror
    hash: d8b995664b717494e1c7cc9b5a511770868d365dadb511978ee8f3e9a6c19a38
  E27:
    record: sys_script_include/1cf5818a878010100e3dd61e36cb0b4a
    field: script
    how: read TaskUtilsSNC.refreshImpactedServices
    result: uses refreshImpactedServicesFromAffectedCIs when com.snc.<task type>.refresh_impacted.include_affected_cis is true, otherwise refreshImpactedServices; then notifies the user
    hash: fb29844c2ed2602a3fab55d939a18eca34518a7f8a0a36f797fc2fad4a4e3f7c
  E28:
    record: sys_properties/75e8df71874010100e3dd61e36cb0b6e
    field: value
    how: read com.snc.incident.refresh_impacted.include_affected_cis
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E29:
    record: sys_script/6f8daf204a3623120146c79f308310df
    how: read Sync CI with Affected CIs
    result: active, after insert and update on task when cmdb_ci changes
    hash: 16969241b5aa614c687dbc7453668d7c62e091abd7388b228a664e44039bf364
  E30:
    record: sys_script/429f991b0b323200ed45478d83673ac5
    how: read Sync BS with Impacted Services
    result: active, after insert and update on incident, problem and change_request when business_service changes
    hash: 9cc1459214f930f3891c27fad6f0cafc5d1f24777d03b68f76fd9768f2326f8a
  E31:
    record: sys_script/09fa6af10a0a0b1d00c6605ebe45bc26
    how: read Affected ci notifications
    result: 'active, after update on task when the state changes and the task has affected CIs; queues ci.notification.for.task'
    hash: f9192aa35a00764f668dcce9699740387572c5d5b23084b7435d48fb6ca15dad
  E32:
    record: sysevent_script_action/14d2e73777023110a69410ed9f5a9990
    how: read Handle Affected CIs for Task
    result: active; calls CMDBAffectedCINotificationsUtils.handleTaskAffectedCIs
    hash: 191634416dcfbd7f0477694bd0eb8e71f50e0997533ae0174cc05edc61de08b8
  E33:
    record: sys_script_include/d01661f477d63110a69410ed9f5a994c
    field: script
    how: read CMDBAffectedCINotificationsUtils
    result: 'queues ci.affected for each affected CI with subscribers, up to NotifyAffectedCI.max_cis CIs and NotifyAffectedCI.max_events events'
    hash: 39c94d6e8e84c3ec694b64269f44519e3e927a63ddcaaa64caeb9acdea19d7c6
  E34:
    record: sysevent_email_action/8e0a46fa0a0a0286002d78c0934d827c
    how: read CI affected
    result: active, on incident, event ci.affected, subscribable, no fixed recipients
    hash: 42e869520ab18888b59f30ba6e7bcc7a19a431202840130782f409c14a8d42d5
  E35:
    record: sys_declarative_action_assignment/77291ca1a3320210ebb11e3f26fcdad6
    how: read Create outage (sn_sow_inc, task_outage)
    result: no condition, no roles; the Add and Remove outage actions of sn_sow_itsm_common have no condition either
    hash: 1292783c440ea0b09b645cc11430b14b16bc0403277f44552c4535a3f3df46ae
  E36:
    record: sys_declarative_action_assignment/4da8c987eb322110dd0583402a52288e
    how: read Send Sms (sn_sow_itsm_common)
    result: 'action bar button on task, condition: not a new record and NotifyUXFTelephonyUtil.canViewSendSMS'
    hash: 34019b0113ca3601d4d915ca4908620e155c4cd3735a90036a0771e47f4d7211
  E37:
    record: sys_script_include/8236d755eb0e2110dd0583402a52280e
    field: script
    how: read NotifyUXFTelephonyUtilSNC.canViewSendSMS
    result: needs the user to be conference leader on the record, NotifyUtil.canAccessSendSms, and a NotifyUIBVisibility handler that allows it
    hash: 75db0f3724e04beaa275950e5bfeacc3e7b4a4314ee77cde12669645bdec02b1
  E38:
    record: sys_script_include/0d49ed2d0ba323008401818393673ae2
    field: script
    how: read NotifyUtilSNC.canAccessSendSms
    result: 'role notify_view or notify_admin, glide.notify.task.phone_number set or glide.enable.notify_on_task true, an active SMS-capable Notify number, and an active record'
    hash: a77928b73f96227d34b89f8eead38ca9efdf994e6aece40751b23f51e21d8b8f
  E39:
    record: sys_script_include/1377014387426110f46c43f09bbb35fc
    field: script
    how: read SOWNotifyIncidentVisibilitySNC.canShowSendSMS
    result: allowed when the user can write the incident
    hash: f8eb56ca83513efde94d6d2f4597c5b9dc790315c71241dfe38b52e960090ee1
  E40:
    record: sys_properties/ecbaddf3872833000e3dd61e36cb0bd0
    field: value
    how: read glide.enable.notify_on_task
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E41:
    record: sys_properties/93efb3c2eb200200fd7b4eff2206fe39
    how: read glide.notify.task.phone_number
    result: the value is redacted in the mirror
    hash: 7ad8ead634156485325eb3b22253e7433521b52eaa82848c8c3de22128e939f5
  E42:
    record: sys_properties/5a6d11fb87e833000e3dd61e36cb0b5c
    field: value
    how: read com.snc.iam.enable_notify
    result: "false"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## The applications {label=NEW}

| Scope | What it gives incident management |
|---|---|
| `sn_sow_itsm_common` | the three dependency-view field actions, the **Map** route, the Add and Remove actions of the main view's impact lists, **Send Sms** |
| `sn_sow_inc` | the incident overview's **Impact** section and its own Add, Remove and Refresh actions, the related list layout, **Create outage** |
| `sn_cmdb_ws` | the CMDB Unified Map page that the Map route shows [E09] |
| global | the sync business rules, `CIUtils` and `TaskUtilsSNC`, the *CI affected* notification |

## 1. Dependency views {label=NEW}

Three field actions on `task`, for the Service Operations Workspace view, each shown when its
field has a value and with no required role: **CI dependency view** (`cmdb_ci`), **Service
dependency view** (`business_service`), **Service offering dependency view**
(`service_offering`). [E01] [E02] [E03]

Each opens the route `unifiedmap` in the current workspace, rooted at the field's value, with the
node class and five levels. [E04] [E05] [E06] [E07] The route [E08] renders the CMDB Workspace's
Unified Map page. [E09] What the map shows is governed by CMDB read access, not by these actions.
`glide.bsm.max_levels` (3) affects only the classic dependency view. [E10]

## 2. Affected CIs and Impacted Services/CIs {label=NEW}

The incident's workspace form lists `task_ci` and `task_cmdb_ci_service` near the top of its
related lists, and `task_outage` and `task_location` further down. [E11] The incident overview
shows the same two lists, and the affected CIs that have an asset, as cards in its Impact section.
[E12]

Kept in step by business rules:

| Rule | Does |
|---|---|
| *Sync CI with Affected CIs* | adds `cmdb_ci` to Affected CIs and removes the previous one [E29] |
| *Sync BS with Impacted Services* | adds `business_service` to Impacted Services/CIs and removes the previous one [E30] |

Add and Remove differ by view:

| View | Add / Remove on Affected CIs and Impacted Services/CIs |
|---|---|
| `sow` (main form, `sn_sow_itsm_common`) | only if the incident's class is listed in `com.snc.task.associate_ci` [E13] [E14] [E15] |
| `sow_incident_overview` (`sn_sow_inc`) | whenever the incident is active [E17] [E18] [E19] [E20] |

`com.snc.task.associate_ci` belongs to `sn_change_admin`, and its value is redacted in the mirror
[E16]: check on the instance whether `incident` is in it. Add opens a many-to-many picker on
`cmdb_ci` with a Configuration Class filter. [E21] [E22] Removing the primary CI from Affected CIs
is refused in both views. [E14] [E19]

Outages: **Create outage**, Add and Remove have no condition and no role. [E35]

## 3. Refresh impacted services {label=NEW}

*Refresh impacted services* on `task_cmdb_ci_service`, overview view, for `itil` and
`sn_incident_write` [E23]; the classic form has *Refresh Impacted Services* in its context menu.
[E24] Both are shown only for the task classes in `com.snc.task.refresh_impacted_services`
[E25], an `sn_cmdb_admin` property whose value is redacted in the mirror. [E26]

The refresh runs in `TaskUtilsSNC`: with `com.snc.incident.refresh_impacted.include_affected_cis`
false on pdi2 [E28], it deletes the rows not added by hand and inserts the services affected by
the incident's CI, then tells the user it has finished. [E25] [E27]

## 4. CI subscribers {label=NEW}

| Step | Record |
|---|---|
| State of a task with affected CIs changes | business rule *Affected ci notifications* → event `ci.notification.for.task` [E31] |
| Script action *Handle Affected CIs for Task* | `CMDBAffectedCINotificationsUtils.handleTaskAffectedCIs` [E32] |
| One `ci.affected` event per subscribed CI, within the `NotifyAffectedCI.*` limits | [E33] |
| Notification *CI affected*, subscribable | [E34] |

## 5. Send Sms: a separate feature, off on pdi2 {label=NEW}

`sn_sow_itsm_common` also puts **Send Sms** in the action bar of any task, incident included.
[E36] It is not part of dependency views: it sends a text message through **Notify** to people
about the record. It is shown only when all of these hold [E37] [E38] [E39]:

| Condition | pdi2 |
|---|---|
| the user has `notify_view` or `notify_admin` | not known from the mirror |
| `glide.notify.task.phone_number` set, or `glide.enable.notify_on_task` true | `notify_on_task` false [E40]; the phone number is redacted [E41] |
| an active Notify number that can send SMS | numbers are data, not in the mirror; Notify for incident communication is off [E42] |
| the user can write the incident and is conference leader | |

With `notify_on_task` false and no sign of a Notify number, **Send Sms** is very likely hidden for
every resolver on pdi2, which matches the SMS channel being off for
communications (see [Communicate](see:communicate)). Enabling it needs a Notify provider and
number: a decision for the process owner, not a configuration tweak.

## Not yet seen {label=OPEN-QUESTION}

1. Is `incident` listed in `com.snc.task.associate_ci` and in
   `com.snc.task.refresh_impacted_services`? Their values are redacted in the mirror. [E16] [E26]
2. Which incident page do resolvers land on: the overview (Impact section) or the main form?
3. Should resolvers be able to edit CMDB connections from the Map, or should that be limited to
   CMDB roles?
4. Is SMS through Notify wanted for incidents at all, or should **Send Sms** be left off?
