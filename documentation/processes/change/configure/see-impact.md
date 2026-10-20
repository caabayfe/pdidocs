---
title: A change's impact - configuration
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
    record: sys_ux_app_route/518e5a48f8d56a10f8775f2783e9b748
    how: read Map (Service Operations Workspace)
    result: route unifiedmap, which renders the CMDB Workspace's Unified Map page
    hash: 23242da376b338da5be12f83e43b9bd1af3e56edd3cced60f8a451b6da8a7642
  E06:
    record: sys_ui_related_list/4caebd7cb7330010dff9fa13ee11a9e9
    children: sys_ui_related_list_entry
    how: read Change Request - Default view related lists
    result: 'task_ci.task, task_cmdb_ci_service.task, task_service_offering.task, sysapproval_approver, change_task, cab_agenda_item, problem.rfc, incident.rfc, incident.caused_by, task_sla, task_outage.task'
    hash: 548c328822eae72b075679d69b9951be3700fee9a27b6b232664ad2339f8dc21
  E07:
    record: sys_ui_related_list/3a6042fcb7330010dff9fa13ee11a92d
    children: sys_ui_related_list_entry
    how: read Change Request - Workspace related lists (sn_itsm_workspace)
    result: the same eleven lists in the same order
    hash: 4d275fb51b4ea0feba3a6010c3d69f377b449b7a3aeec6cc1923a460dc850fc9
  E08:
    record: sys_script/6f8daf204a3623120146c79f308310df
    how: read Sync CI with Affected CIs
    result: active, after insert and update on task when cmdb_ci changes; deletes the previous CI's task_ci row, inserts the new one
    hash: 16969241b5aa614c687dbc7453668d7c62e091abd7388b228a664e44039bf364
  E09:
    record: sys_script/57dd38bb53d3101034d1ddeeff7b129f
    how: read Add CI to Affected CIs
    result: 'active, after insert on change_request with a CI, only when change.conflict.mode is advanced; ChangeCollisionHelper.addCiToChangeAffectedCis'
    hash: b31c7dd21c9cced9f72b811c454403677f88055d5c15880114c898879e1bae5b
  E10:
    record: sys_script/79d9cf820a0a2c3e1bc20f964f0b8866
    how: read Add CI to Affected CIs on change
    result: active, after update on change_request when the CI changes, same mode condition, and only if the CI is not already affected
    hash: fa1143004b9977ebb67fc89be54110f7711cf122b4303fa5a4bda6908d2423ce
  E11:
    record: sys_properties/8839089d0a0a2c3e22a1770ed1b7ecc4
    how: read change.conflict.mode
    result: 'Basic checks only the change''s CI; Advanced checks every affected CI and adds the change''s CI to them; private, the value is redacted in the mirror'
    hash: 6630d2320b3ea594b489d67f02aa1090cccb2781753a57019ac5aa02f53fda6b
  E12:
    record: sys_script/429f991b0b323200ed45478d83673ac5
    how: read Sync BS with Impacted Services
    result: active, after insert and update on incident, problem and change_request when business_service changes
    hash: 9cc1459214f930f3891c27fad6f0cafc5d1f24777d03b68f76fd9768f2326f8a
  E13:
    record: sys_declarative_action_assignment/fe3d9a487331301045216238edf6a7ff
    field: script_condition
    how: read SOW task CI add (sn_sow_itsm_common, view sow)
    result: "parent.active, the parent's class listed in com.snc.task.associate_ci, and new global.ChangeProposed(parent).canAddCI(); client action Task CI MRA"
    hash: 1f90237ce5705001975ec2f236bd366b1441125d65534d3153ff3705871457b5
  E14:
    record: sys_declarative_action_assignment/702ede887371301045216238edf6a7d3
    field: server_script
    how: read SOW task CI remove (sn_sow_itsm_common, view sow)
    result: condition parent.active and the class listed in com.snc.task.associate_ci (no canAddCI); keeps the primary CI with an info message, deletes other rows
    hash: a863ecbc448bde5fe52b4d28512e80e309ee6b513e351331c8090e67f94b4803
  E15:
    record: sys_declarative_action_assignment/0f86af9873f9301045216238edf6a796
    field: script_condition
    how: read SOW task cmdb ci service add (sn_sow_itsm_common, view sow), and its Remove 1ce6a7d873f9301045216238edf6a70e
    result: parent.active and the table listed in com.snc.task.associate_ci
    hash: 0df2baa26d09ad3ef0b3ee54960149af4c39fe3885df364eb9fa58b40620ce38
  E16:
    record: sys_declarative_action_assignment/dfb40eb1c7e150108a430d8c95c2606a
    how: read add_ci_to_task (global, no view), and remove_ci_items 45788635c7e150108a430d8c95c26099
    result: 'Add and Remove ({{count}}) on task_ci for any workspace without a view-specific action; both need the property and canAddCI'
    hash: 037b9aab22048da6ed1477d67dfa92984db68e8af34d14bc1e655454e22ec1f1
  E17:
    record: sys_declarative_action_assignment/4044e0a123e333001488dc1756bf650f
    how: read create-new on task_ci (sn_itsm_workspace)
    result: New on Affected CIs, with the same canAddCI and property conditions and current.canCreate()
    hash: daece17c8118daa5672d3e6d447b869080f26bd3e5f3c027ce35204a850b75fe
  E18:
    record: sys_ui_action/77688cfe6f35f100e5f2b3312e3ee4e6
    how: read Add (task_ci, classic list banner button)
    result: 'condition RP.isManyToMany(), ChangeProposed.canAddCI, canCreate, parent active, class in com.snc.task.associate_ci; opens the "Add Affected CIs" modal through AssociateCIToTask'
    hash: 6ed2e9e67b642a22eed0ac2b8233e0cc8cb2edf5938d146a093380b705cf9d0e
  E19:
    record: sys_ui_action/08d172a1932231002f217a75e57ffb39
    how: read Add (task_cmdb_ci_service, classic list banner button)
    result: 'the same for "Add Impacted Services/CIs", without canAddCI'
    hash: fedb65331bfe459072306e28d0d67bdc6161dd4a044424e90859796f7a17a405
  E20:
    record: sys_properties/0abd8ea1931331003b7a7a75e57ffbd9
    how: read com.snc.task.associate_ci
    result: 'task types whose CIs are associated through a list; read and write role sn_change_admin; the value is redacted in the mirror'
    hash: f1613b1e1513ea90548144a143f027c44bf725cf4ac71160d6ef7ea49de9f812
  E21:
    record: sys_script_include/34c5622bd70112002ba7b46c015203dc
    field: script
    how: read ChangeProposed.canAddCI
    result: true for any task that is not a change; for a change, ChangeRequest.canModifyCI()
    hash: 32f1e7808fc957e61e25a527ce2a2c7fde8df14c0d333575966d38cb45f1149e
  E22:
    record: sys_script_include/c4d9924deb1102002a7a666cd206fedf
    field: script
    how: read ChangeRequestSNC.canModifyCI and _getAPI
    result: through the change model API when chg_model is set, otherwise the type API; the default is the initial state only
    hash: ede70ae25eb3b18ec219e2dee8905b653bb7683b641757eb0c8d8dfb44e74921
  E23:
    record: sys_script_include/0f41f8eb5303101034d1ddeeff7b12fd
    field: script
    how: read ChangeModelChgReqAPISNC.canModifyCI
    result: 'if the model has the attribute allow_ci_modification, the states that carry it; otherwise the initial state'
    hash: 3d777ad6acda5b6e9c197127da1dc83023aa067ff2a62d4a3eac44167884e11b
  E24:
    record: chg_model_attribute/9fbfd18affa431107f54ffffffffff03
    how: read Allow CI Modification
    result: 'model attribute allow_ci_modification on change_request: "Allow modification of the CI(s) related to this Change Request"'
    hash: 8030ea633f1b137ccb451cebdbf2f13c9a5ceb5a7560074db9f0fe108e3554ce
  E25:
    record: sys_script/dba9c3abff6431107f54ffffffffff86
    how: 'read Change Model: Read only CI (Insert), and its Delete fddaef16ffa40210bb76ffffffffffbc and Update 251eaf1affa40210bb76ffffffffffa8'
    result: 'before rules on task_ci, order 110: for a model-based change that cannot modify CIs, abort with "Affected CIs cannot be modified for Change Requests in this state"; rows from dynamic CI groups are exempt'
    hash: bb466cdf11a9198be7d9943a5c7a49f0fea3f0ef271b686fe0225bec3a1cadfc
  E26:
    record: sys_script/934d43efff6431107f54ffffffffff98
    how: 'read Change Model: Read only CI (change_request, before, order 900)'
    result: '"Configuration item cannot change for Change Requests in this state", under the same model rule'
    hash: eb445ea5257dd9781171adaf8b44d9bfdf93fc79e8675d7102c36608b68b4f8a
  E27:
    record: sys_script/08cf6ffe23203300a5eedc1756bf657f
    field: script
    how: read Refresh Impacted Services (change_request)
    result: 'active, after insert and update, when inserted past New or changesFromNew() on an active change; calls TaskUtils.triggerRefreshImpactedServices'
    hash: 124c6e6c01b907533fb33d7aafe2c1aa610b9c27cae0c5f014d236953ed41528
  E28:
    record: sys_script_include/1cf5818a878010100e3dd61e36cb0b4a
    field: script
    how: read TaskUtilsSNC.triggerRefreshImpactedServices and notifyUser
    result: 'for change_request, hands over to ChangeUtils.refreshImpactedServices with the event flag; notifyUser posts the completion message as a sidebar chat when glide.ui.polaris.experience is true'
    hash: fb29844c2ed2602a3fab55d939a18eca34518a7f8a0a36f797fc2fad4a4e3f7c
  E29:
    record: sys_properties/33c7c26b239160101488dc1756bf653b
    field: value
    how: read com.snc.change_request.refresh_impacted.event
    result: "true: the refresh runs in the background and the user is notified when it completes"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E30:
    record: sys_properties/e3323414c31330104e44ce72a740ddad
    field: value
    how: read com.snc.change_request.refresh_impacted_services.message.show
    result: "false: no \"Refresh impacted services has been initiated\" message on the form"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E31:
    record: sysevent_script_action/3e2eb17223a823001488dc1756bf656c
    field: script
    how: read Trigger refresh impacted cis (event change.refresh_impacted_ci)
    result: active; ChangeUtils.createRefreshWorker(change, user)
    hash: 0e507a09be668c74530a9614a00654a592384e6aea3566329b0656f45eb83ea4
  E32:
    record: sys_properties/efb68c84b72c321013d4807cae11a99f
    field: value
    how: read com.snc.task.refresh_impacted_services.useprogressworker
    result: "false: the refresh runs as a change management worker (chg_mgt_worker), not a progress worker"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E33:
    record: sys_script_include/2ddf83eb9fa331002920bde8132e7044
    field: script
    how: read ChangeUtilsSNC (refreshImpactedServices, createRefreshWorker, getImpactedServicesFromAffectedCIs, getImpactedServicesFromPrimaryCI, _addAdditionalServices)
    result: 'services from the affected CIs or from the primary CI; adds conflict services when change.conflict.populateimpactedcis is true and com.snc.change.collision is active, and applications when com.snc.service-mapping is active; replaces the rows with manually_added false; refreshes the other related lists; notifies "Refresh impacted services for change request {0} has completed"'
    hash: 8d79e81d45091a1e51f81a7578d8b2f66ce9b2bb56ad85c61251f6616927eca8
  E34:
    record: sys_properties/357e737623d023001488dc1756bf65fb
    field: value
    how: read com.snc.change_request.refresh_impacted.include_affected_cis
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E35:
    record: sys_script_include/c93a87d20a0a0b1d0196af61b0ca8db5
    field: script
    how: read CIUtils._getImpactedServicesFromAffectedCIs, removeImpactedServices, canShowRefreshServicesUIAction
    result: 'services from svc_ci_assoc joined to the task''s affected CIs ("this table has entries when Service Mapping is being used"); deletes rows with manually_added false; the refresh action shows only for classes in com.snc.task.refresh_impacted_services'
    hash: d0ffe3a4077a604252a5612b8e3c35150410e6b62b0b3444edcbd8ba1ffeec31
  E36:
    record: sys_properties/70f4e36f67f103006e6eadab9485ef4e
    field: value
    how: read change.conflict.populateimpactedcis
    result: "true"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E37:
    record: sys_dictionary/6b32727f8c9103100a22deb6dd2b4e24
    how: read task_cmdb_ci_service.manually_added
    result: default true
    hash: 62387660a7373dfc68d1d22b8f3d3e336dab039321df5fbde25cbd1aaf777653
  E38:
    record: sys_ui_action/baae03f0673303006e6eadab9485ef14
    how: read Refresh Impacted Services (change_request, form context menu)
    result: 'condition CIUtils.canShowRefreshServicesUIAction(current.sys_class_name); saves and calls TaskUtils.triggerRefreshImpactedServices'
    hash: 2911746a8754c9f4c9fac77605b08a6f0176aa169aeec85580a98865ded0cb18
  E39:
    record: sys_properties/eee3f4c2531203006725ddeeff7b1286
    how: read com.snc.task.refresh_impacted_services
    result: read and write role sn_cmdb_admin; the value is redacted in the mirror
    hash: d8b995664b717494e1c7cc9b5a511770868d365dadb511978ee8f3e9a6c19a38
  E40:
    record: sys_ui_action/3df20057c3122200b6dcdfdc64d3aed1
    how: read Create Outage (change_request, form context menu)
    result: 'no condition; roles itil and sn_change_write (sys_ui_action_role); saves and opens cmdb_ci_outage with cmdb_ci, task_number and short_description'
    hash: 4cad4295fca70912392f95aaf6fcb055c9e73d1e1c45b76d3fd44ca5ecfb8b63
  E41:
    record: sys_ui_action/c352031323c333001488dc1756bf6598
    how: read Create Outage (change_request, workspace form menu)
    result: 'form_menu_button_v2, condition not a new record, same roles; no sys_ux_form_action maps it for change_request'
    hash: 896b8c9380082135eca427d46ec53e057fe5d0d75d44cb4253ceab14efffc029
  E42:
    record: sys_declarative_action_assignment/77291ca1a3320210ebb11e3f26fcdad6
    how: read Create outage (sn_sow_inc, task_outage, view sow)
    result: no condition, no roles; client action Create New Record on cmdb_ci_outage
    hash: 1292783c440ea0b09b645cc11430b14b16bc0403277f44552c4535a3f3df46ae
  E43:
    record: sys_declarative_action_assignment/ba87ed99eb46301080de83402a522862
    how: read Add on task_outage (sn_sow_itsm_common, view sow), and its Remove 6330ded9eb86301080de83402a52280e
    result: no condition, no roles
    hash: d979e2d0a1dcba8c43cdd0f692a7b8571d30e73dc4f62a000f2dc433cea9b0bd
  E44:
    record: sys_declarative_action_assignment/12a76b29c7ad10108a430d8c95c26072
    how: read add_outage_to_task (global, no view), and remove_outages 46f0c875c7ed10108a430d8c95c260f7
    result: condition excludes change_request and sn_customerservice_case
    hash: 8128fc1500305db3edc7415b22fda038afdebe87aa296470ca566e9aea5ec1ed
  E45:
    record: sys_script/09fa6af10a0a0b1d00c6605ebe45bc26
    how: read Affected ci notifications
    result: 'active, after update on task when the state changes and the task has affected CIs; queues ci.notification.for.task, changes included'
    hash: f9192aa35a00764f668dcce9699740387572c5d5b23084b7435d48fb6ca15dad
  E46:
    record: sysevent_email_action/8e0a46fa0a0a0286002d78c0934d827c
    how: read CI affected
    result: active, on incident only, event ci.affected, subscribable
    hash: 42e869520ab18888b59f30ba6e7bcc7a19a431202840130782f409c14a8d42d5
  E47:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Service Operations Workspace, a normal change in New, header
    how: opened More actions
    result: 'Compose Email, Delete (no Create Outage)'
---
## The applications {label=NEW}

| Scope | What it gives change management |
|---|---|
| `sn_sow_itsm_common` | the three dependency-view field actions, the **Map** route, Add and Remove on Affected CIs, Impacted Services/CIs and Outages in the `sow` view |
| `sn_sow_inc` | **Create outage** on the Outages list in the `sow` view, used by changes too [E42] |
| `sn_itsm_workspace` | the workspace related list layout, **New** on Affected CIs [E07] [E17] |
| global | the sync and refresh business rules, `ChangeProposed`, `ChangeUtilsSNC`, `CIUtils`, the change-model rules, the classic Add, Refresh and Create Outage actions |

## 1. Dependency views {label=NEW}

The three field actions are on `task`, so a change gets them with no change-specific record:
**CI dependency view** (`cmdb_ci`), **Service dependency view** (`business_service`) and **Service
offering dependency view** (`service_offering`), each shown when its field has a value, with no
required role. [E01] [E02] [E03] Each opens the `unifiedmap` route rooted at the field's value,
five levels deep. [E04] [E05] What the map shows is governed by CMDB read access. Whether change requesters may edit CMDB
connections from the map, or only CMDB roles, is not decided yet. [Q08] The same records
are described for incidents in [Dependency views and impact lists](see:incident/see-impact).

## 2. The related lists {label=NEW}

Both change layouts put `task_ci` first, then `task_cmdb_ci_service` and `task_service_offering`,
and `task_outage` last. [E06] [E07]

Kept in step by business rules, in this order:

| Rule | Does |
|---|---|
| *Sync CI with Affected CIs* (`task`) | adds `cmdb_ci` to Affected CIs and removes the previous one [E08] |
| *Add CI to Affected CIs*, *… on change* (`change_request`, order 10) | the same, only when `change.conflict.mode` is `advanced` [E09] [E10] |
| *Sync BS with Impacted Services* | adds `business_service` to Impacted Services/CIs and removes the previous one [E12] |

`change.conflict.mode` is private and redacted in the mirror. [E11] [Q18] In advanced mode conflict
detection checks every affected CI, so Affected CIs matters for scheduling as well as impact.

## 3. Add and Remove on Affected CIs {label=NEW}

| Where | Action | Condition |
|---|---|---|
| Workspace, `sow` view | Add (Task CI MRA picker) | active, class in `com.snc.task.associate_ci`, `ChangeProposed.canAddCI()` [E13] |
| Workspace, `sow` view | Remove | active, class in `com.snc.task.associate_ci`; refuses the primary CI [E14] |
| Workspace, `sow` view | Add, Remove on Impacted Services/CIs | active, table in `com.snc.task.associate_ci` [E15] |
| Other workspaces (no view) | Add, Remove (global) | as the `sow` Add [E16] |
| Workspace | New on Affected CIs (`sn_itsm_workspace`) | as the `sow` Add, and `canCreate()` [E17] |
| Classic form | Add banner button, *Add Affected CIs* / *Add Impacted Services/CIs* modals | as above; the services one without `canAddCI` [E18] [E19] |

`com.snc.task.associate_ci` belongs to `sn_change_admin` and its value is redacted [E20]: check
on the instance that `change_request` is in it. [Q17] These are the actions that cmdb's feature
*affected-cis-tasks* refers to; problems use the same records.

`canAddCI` is true for any task but a change; for a change it asks `canModifyCI()`. [E21] That
uses the change model when `chg_model` is set: with the model attribute *Allow CI Modification*,
the states that carry it; without it, the initial state only. [E22] [E23] [E24] The model's state
attributes aren't in the mirror. [Q19]

The workspace Remove doesn't check `canAddCI`, but the *Change Model: Read only CI* rules on
`task_ci` abort inserts, deletes and updates for a model-based change that can't modify CIs (rows
from dynamic CI groups excepted), and a sibling rule on `change_request` stops the CI field
changing. [E14] [E25] [E26]

## 4. Refresh impacted services {label=NEW}

| Step | Record |
|---|---|
| The change is inserted past *New*, or leaves *New*, while active | business rule *Refresh Impacted Services* [E27] |
| `TaskUtils.triggerRefreshImpactedServices` → `ChangeUtils.refreshImpactedServices` | with `refresh_impacted.event` true, queues `change.refresh_impacted_ci`; no "initiated" message, as `message.show` is false [E28] [E29] [E30] |
| Script action *Trigger refresh impacted cis* | `createRefreshWorker`: a `chg_mgt_worker`, not a progress worker [E31] [E32] [E33] |
| `getImpactedServicesFromAffectedCIs` (as `include_affected_cis` is true) | services from `svc_ci_assoc` for every affected CI [E33] [E34] [E35] |
| `_addAdditionalServices` | adds the conflict services (`change.conflict.populateimpactedcis` true), and Service Mapping applications when that plugin is active; deletes rows with `manually_added` false and inserts the new ones [E33] [E35] [E36] |
| `TaskUtils.notifyUser` | *"Refresh impacted services for change request {0} has completed"*, as a sidebar chat [E28] [E33] |

`manually_added` defaults to true, so services added by hand or by *Sync BS* survive every
refresh. [E37] On the classic form, *Refresh Impacted Services* in the context menu runs the same
refresh, shown only when `change_request` is in `com.snc.task.refresh_impacted_services`, an
`sn_cmdb_admin` property whose value is redacted. [E38] [E39] [E35] [Q17] The Service Operations
Workspace has no refresh action for changes: the incident overview's is for incidents only.

`svc_ci_assoc` links CIs to the application services they belong to; the script's own comment
says it "has entries when Service Mapping is being used". [E35] CIs in no such service add nothing. Service Mapping is inactive on
pdi2, so whether `svc_ci_assoc` holds anything for the demo services isn't known. [Q20] The CMDB page states the same rule for changes in short:
[Affected and impacted](see:cmdb/impact).

## 5. Outages {label=NEW}

| Where | Action | Condition |
|---|---|---|
| Classic form | *Create Outage* (context menu) | no condition; `itil`, `sn_change_write`; prefills CI, task, short description [E40] |
| Workspace header | *Create Outage* (`form_menu_button_v2`) | no `sys_ux_form_action` maps it for changes [E41]; not in the menu as admin [E47] |
| Workspace, `sow` view, Outages list | *Create outage*, Add, Remove | no condition, no roles [E42] [E43] |
| Other workspaces | global Add and Remove | exclude `change_request` [E44] |

## 6. CI subscribers {label=NEW}

*Affected ci notifications* queues an event for any task, changes included, when its state
changes [E45], but the only *CI affected* notification is on `incident`. [E46] Subscribers aren't
told about changes; adding a change notification would be a process owner's decision.
