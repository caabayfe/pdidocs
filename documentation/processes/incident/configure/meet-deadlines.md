---
title: Incident SLAs - configuration
reviewed: 2026-10-19
evidence:
  E01:
    record: contract_sla/2ca94b74c3143200b6dcdfdc64d3ae93
    how: read Priority 1 response (15 minutes)
    result: 'start active=true^priority=1^assignment_groupISNOTEMPTY; stop state!=1^assigned_toISNOTEMPTY; no pause; flow Default SLA flow; retroactive, set_start_to sys_created_on, retroactive_pause true; when_to_cancel no_match, reset_action cancel'
    hash: 432d40f389fdbc967319820583344ed835a7d679dfdf051283a5642e5940c691
  E02:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: 'start active=true^priority=1; pause incident_state 3 with hold_reason 1, or incident_state 6; stop incident_state=7; flow SLA notification and escalation flow; retroactive from sys_created_on'
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E03:
    record: contract_sla/752bcf74c3143200b6dcdfdc64d3aeeb
    how: read Priority 2 response (1 hour)
    result: 'schedule 8-5 weekdays, schedule source the SLA definition; time zone task.caller_id.time_zone; flow Default SLA flow'
    hash: 933e26eadf78b9aaa6a9718a5a23074e1153ed3c6d5700f0baf7a75bbbad59ef
  E04:
    record: contract_sla/ba320982d732220035ae23c7ce610347
    how: read Network group resolution (OLA)
    result: 'start assignment_group is one network group; stop the group changes or incident_state=7; not retroactive, set_start_to approval_set; no schedule; SLA notification and escalation flow'
    hash: 6849c0eec1ffe5b482cf495acc8d91437f2cda28ec7b8ab78dbc770b0f0f59bc
  E05:
    record: contract_sla/b222c582d732220035ae23c7ce6103a7
    how: read Database group resolution (P1 only) (OLA)
    result: 'start one database group and priority 1; stop the group changes or Closed; not retroactive'
    hash: 5cb4335dc3b645c084d6c989f13f40a3f7cd8bc37f8b5e8585d73b9abb5a1635
  E06:
    record: contract_sla/3b524982d732220035ae23c7ce6103e4
    how: read SAN 001 contract resolution (3.5 hour), type Underpinning contract
    result: 'start cmdb_ci is one CI; stop the CI changes or Closed; not retroactive'
    hash: 2bdb2fd131cf6b8b6f5cc3ba0352a27192fac949838c7114c1e2a01eddb161b6
  E07:
    record: contract_sla/540a4606b7e233004fbc2089ee11a919
    how: read ATF - test start/pause/stop conditions (sn_slm_atf)
    result: active, type SLA, on incident; starts only when the short description begins "ATF SLA Incident"
    hash: 04a930efe34a12a8f6d021eebd1a7ab9bbbb6a2723dea5f6fe783c6033b4d331
  E08:
    record: contract_sla/00e277560f6233004fbc309c4e767e1e
    how: read ATF - test all conditions (sn_slm_atf)
    result: active, type SLA, on incident; starts only when the short description begins "ATF SLA Incident 2"
    hash: 403a44ca2c5d56ee03208693d16fbc9985949689b3c763fe1360842509589750
  E09:
    record: sys_script/6fab2e470a0007045931f2a692878933
    field: template
    how: read Incident State Active on Assignment (before insert and update, incident_state=1 and assigned_to set)
    result: incident_state=2^state=2
    hash: 58be17deb5269266bd3159116c61b94cb36048480ccfe0916d542fcfa32bc746
  E10:
    record: sys_hub_flow/828f267973333300e289235f04f6a7a3
    children: sys_hub_action_instance
    how: read the Default SLA flow, trigger sla_task, run as system
    result: 'wait 50%: sla.warning.parm to Assigned to; wait 75%: sla.warning.parm to Assigned to; wait has_breached=true: sla.warning.breach.parm to Assigned to and to Assigned to''s manager'
    hash: 7c762de74e156b3df407dbcd9fb4b8afd6f83e897c7eb6a80f93e18911bf569f
  E11:
    record: sys_hub_flow/0335e63573333300e289235f04f6a70f
    children: sys_hub_action_instance
    how: read the SLA notification and escalation flow, trigger sla_task, run as system
    result: 'wait 50%: sla.warning.parm to Assigned to, sla.warning.ci to the CI''s Supported by; wait 75%: sla.warning.parm to Assigned to and to the manager; breach: sla.warning.breach.parm to Assigned to and the manager'
    hash: 62ba93abaeb23e27747ba4da6f567ddec8f9bd260ddd998a962ff8c0884bf5b8
  E12:
    record: sys_hub_flow/fd081f1873110010e289235f04f6a75c
    how: read Incident SLA Flow - Incident Communication Task (copied from Default SLA flow)
    result: '"Sends a Communication warning event at 75% of the SLA''s duration followed by a Communication overdue event when the SLA breaches"'
    hash: 7ede8940b33603c9cd10f7239aff2d626c0a94fdff26a6d89a1baba4ac7a8e2d
  E13:
    record: sysevent_email_action/9660628ed7a2220035ae23c7ce61039e
    how: read SLA warning Parm
    result: 'task_sla, event sla.warning.parm, recipient event.parm1; mail scripts sla.salutation.event_parm1 and sla.warn_message.event_parm1'
    hash: 5e293724f3d4e57b015ee109024c97e35030dd9957e0ec493a0fd44ada86c5e8
  E14:
    record: sysevent_email_action/93a0ee4ed7a2220035ae23c7ce610368
    how: read SLA breached Parm
    result: 'task_sla, event sla.warning.breach.parm, recipient event.parm1; mail script sla.breach_message.event_parm1'
    hash: 20fd6bbbffa0fd489711f6961beec9b56c821368498903bc1b59408da201e985
  E15:
    record: sysevent_email_action/8d324981d7d6220035ae23c7ce6103b5
    how: read SLA warning CI Supported By
    result: task_sla, event sla.warning.ci, recipient event.parm1
    hash: c54ea34a96bdb5935ea62006a53c425af14d1ef6c01e3c304e46fb7fc020f665
  E16:
    record: sysevent_email_action/da628981d7d6220035ae23c7ce6103eb
    how: read SLA breached CI Supported By
    result: task_sla, event sla.warning.ci.breach, recipient event.parm1
    hash: dbae0574e66ba07d9807899fd19307a2d23ca07d099d50d7b765a1ac0a451fb7
  E17:
    record: sys_script_email/37afdfa7cb601300dff9b9c0c24c9ca4
    field: script
    how: read sla.warn_message.event_parm1
    result: adds "assigned to …" to the text when the recipient isn't the task's assignee
    hash: c6e7e9074440ac98c25b21de94712ea3e5dddaf29273df165a4f6d7f6d08fec4
  E18:
    record: sys_script_email/97d7b4bfcba01300dff9b9c0c24c9c32
    field: script
    how: read sla.breach_message.event_parm1
    result: the same rule for the breach text
    hash: c19b39ad2f892bd58180186cf9c8d72e8b333eb337a439ab3984c6de2f72ba4f
  E19:
    record: sys_properties/6d2b60427f0000016a7ec9e914cc4cee
    field: value
    how: read com.snc.sla.engine.version
    result: '2011'
    hash: 72d1b5da6eeaf1789df86487da50ad5e9dadb5ffaecb56b6de592aa286c9c1b8
  E20:
    record: sys_properties/626bf4b37f0000011be4d4f753415a53
    field: value
    how: read com.snc.sla.run_old_sla_engine
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E21:
    record: sys_properties/6d2c96237f00000178b3be60521423a4
    field: value
    how: read com.snc.sla.engine.async
    result: "false: task SLAs are updated in the same transaction as the incident"
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E22:
    record: sys_properties/98929cf8eb3201003623666cd206fe62
    field: value
    how: read com.snc.sla.workflow.run_for_breached
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E23:
    record: sys_properties/ae828c0ccb400200d71cb9c0c24c9cea
    field: value
    how: read com.snc.sla.repair.enabled
    result: "true: the Repair modules and UI actions are on"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E24:
    record: sys_script/a8a00aedc0a80a160094253cd2b507ad
    field: condition
    how: read Pause SLA on task_sla
    result: runs only when com.snc.sla.engine.version is 2010; Resume SLA, Run SLA calculation and Set planned end time have the same guard
    hash: f548536a623fc3f378f29c57c8cb71219428a29a12cbf820f4e42d23a2803c81
  E25:
    record: sys_script_include/d25975add7533100d82ba1737e610374
    field: script
    how: read SLAUIActions.showRepair
    result: Repair SLAs shows only on the 2011 engine, to sla_admin, not from a related list, and when the table has an SLA definition
    hash: e693a9225bb8f80cac643721d2ed96ae664b108d68d5ab2b8d1da7754164feb7
  E26:
    record: sys_ux_app_route/e934b8dc43032110361dff53e9b8f21c
    how: read the side panel route Record Information (sn_sow)
    result: route type record_info, icon heartbeat-outline, order 100
    hash: c6f0385f3cc330ae2d3c1b2abbebc968d26c9910868f9ae0932f52f659312608
  E27:
    record: sys_ux_screen/afd4b8dc43032110361dff53e9b8f28a
    field: screen_condition
    how: read the screen Record Information SNC (sn_sow_itsm_common)
    result: 'inputTable=incident and inputSysId!=-1, or inputTable=interaction; macroponent Record Information'
    hash: 0c3c66420e5598b4eab7a84eac5afaf3c6bad2c2355e29299febaa2d81bd1253
  E28:
    record: sys_ux_data_broker_transform/2df9404f530230108e4dddeeff7b12fa
    field: script
    how: read the data broker SOW Record Information
    result: for incident and interaction, returns SOWIncidentInfo.getRecordInfo() when the user can read the record
    hash: 0da2721d3f21290b81ab830bee0f590211af772362989c99c570323d2b00fbef
  E29:
    record: sys_script_include/9dd95cb7530230108e4dddeeff7b1223
    field: script
    how: read SOWIncidentInfoSNC.getSLAConfig and getSlaInfo
    result: 'timer configurations af871ab3… (Response SLA) and aca7d6b3… (Resolution SLA); COUNT of task_sla for the record, button "View all SLAs", list title "Task SLAs"'
    hash: eff1ae5f786d0bfc07f05c001bff3c2b85fa1199af2e053cddbeadd4f5c1a544
  E30:
    record: sla_timer_config/af871ab3532730102d05ddeeff7b124f
    how: read Incident Response (sn_sow_inc) and its sla_timer_config_mapping rows
    result: 'source Task to SLA Mapping; show_complete and show_actual_time true, show_cancelled false; mapped in order Priority 1, 2, 3, 4 response'
    hash: f906816631b6093d48832d3dcfeada3c164ed683f6296b990cb4f695f4754c0c
  E31:
    record: sla_timer_config/aca7d6b3532730102d05ddeeff7b12ec
    how: read Incident Resolution (sn_sow_inc) and its mappings
    result: 'source Task to SLA Mapping; show_complete and show_actual_time true; mapped in order Priority 1, 2, 3, 4 resolution'
    hash: 9c3332816dc5f29014cebf959cb071f8b659710d57b69469eaa88a9750793d35
  E32:
    record: sys_script_include/4731d4745712001009993da73d94f9df
    field: script
    how: read SLATimerSNC._getTaskSla
    result: 'per timer, prefers an in-progress then a paused task SLA that has not breached, then the breached ones; completed only when show_complete'
    hash: b2294e5fe3e2174cc1ebf603c60ed6478aedbfb730a32a0595348f919f186195
  E33:
    record: sla_timer_config/0b6478fd53320010a393ddeeff7b1226
    how: read Incident Response and Resolution Team (sn_slm_timer)
    result: the base application's configuration mapping all eight priority SLAs; not the one the incident panel uses
    hash: 3f05768d498f74fd52677fb3d4b981a53a36c7ea3e4d50b2f4561ab949b58857
  E34:
    record: sys_security_acl/bc91c2a5f334621048dff32021103144
    field: description
    how: read the ACL derived from the task_sla read ACL 80d8f477…
    result: 'roles sla_admin, itil, sla_manager, sn_esm_agent'
    hash: 3a4bfd2bd1b84b803d1eecb6debc6be8b07876b4bbb5cf91f75f86273077aa14
  E35:
    record: sys_security_acl/056bb93d874033000e56d61e36cb0be7
    field: description
    how: read the second task_sla read ACL
    result: sn_incident_read, for task SLAs of incidents
    hash: 6a3a0fb1f5cf83e5708b4af8f46de9a591cbdf871a042b7e1470b71c59faa9df
  E36:
    record: sys_security_acl/e8f7b4084bd3cc8f002f3702a419c6c7
    field: description
    how: read the task_sla write ACL
    result: sla_admin only
    hash: 2f55529cfc366ece0405e6f1ba52d962359d041ca902bd4acd8b3e00b1149682
---
## The applications {label=NEW}

| Scope | What it gives |
|---|---|
| global (Service Level Management) | the SLA definitions, the 2011 engine, the SLA flows and the task_sla notifications |
| `sn_slm_timer` | the SLA timer configurations and their mappings [E33] |
| `sn_sow_inc` | the incident's two timer configurations, *Incident Response* and *Incident Resolution* [E30] [E31] |
| `sn_sow`, `sn_sow_itsm_common` | the side panel tab *Record Information* and its *SLAs and timings* section [E26] [E27] |
| `sn_slm_atf` | two test SLA definitions (out of scope) [E07] [E08] |

Thirteen active SLA definitions are on incident: the eleven listed on
[Working an incident - configuration](see:incident/configure/work) and two ATF test definitions
in `sn_slm_atf`, both of type SLA. [E07] [E08] So there are ten SLAs, two OLAs and one
underpinning contract; only the eleven in global apply to real work.

## 1. Attach, pause, stop {label=NEW}

The engine is the 2011 one, synchronous; the old engine is off. [E19] [E20] [E21] The 2010
business rules on `task_sla` (*Pause SLA*, *Resume SLA*, *Run SLA calculation*, *Set planned end
time*) are active but guarded by the engine version, so they don't run. [E24]

| Definitions | Start | Pause | Stop | Retroactive | Flow |
|---|---|---|---|---|---|
| Priority 1-4 response | active, priority n, group set [E01] | none | `state!=1` and assignee set [E01] | yes, from `sys_created_on` | Default SLA flow [E01] [E03] |
| Priority 1-4 resolution | active, priority n [E02] | `incident_state` 3 with hold reason 1, or 6 [E02] | `incident_state=7` [E02] | yes, from `sys_created_on` | SLA notification and escalation flow [E02] |
| Network group, Database group (P1) | assignment group is that group (and priority 1) [E04] [E05] | as resolution | group changes, or Closed | no | SLA notification and escalation flow [E04] |
| SAN 001 contract | `cmdb_ci` is one CI [E06] | as resolution | CI changes, or Closed | no | SLA notification and escalation flow |

All cancel when the start condition stops matching (`when_to_cancel no_match`) and take the
caller's time zone. [E01] [E03] Retroactive SLAs also count past pauses (`retroactive_pause`).
[E01] *Incident State Active on Assignment* sets a New incident with an assignee to In Progress,
which meets both response stop conditions at once. [E09]

## 2. Flows and notifications {label=NEW}

Each task SLA starts its definition's flow (trigger `sla_task`, run as system). Steps wait for a
percentage of the business elapsed time, then fire events whose parm1 is the recipient:

| Flow | 50% | 75% | Breach |
|---|---|---|---|
| Default SLA flow [E10] | `sla.warning.parm` → assignee | `sla.warning.parm` → assignee | `sla.warning.breach.parm` → assignee, assignee's manager |
| SLA notification and escalation flow [E11] | `sla.warning.parm` → assignee; `sla.warning.ci` → CI's Supported by | `sla.warning.parm` → assignee, manager | `sla.warning.breach.parm` → assignee, manager |

| Notification (task_sla) | Event | Record |
|---|---|---|
| SLA warning Parm | `sla.warning.parm` | [E13] |
| SLA breached Parm | `sla.warning.breach.parm` | [E14] |
| SLA warning CI Supported By | `sla.warning.ci` | [E15] |
| SLA breached CI Supported By | `sla.warning.ci.breach` | [E16] |

The mail scripts add the assignee's name when the recipient is someone else. [E17] [E18]
Neither flow fires `sla.warning.ci.breach`, so *SLA breached CI Supported By* never sends from
these flows. [E10] [E11] [E16] With `com.snc.sla.workflow.run_for_breached` true, an SLA attached
already breached (after a priority change) still runs its flow. [E22]

*Incident SLA Flow - Incident Communication Task* serves communication tasks, not incidents: 75%
and breach events for *Communication Due Warning* and *Communication Overdue*. [E12] See
[Communication plans - configuration](see:incident/configure/communicate).

## 3. Timers in the workspace {label=NEW}

1. The route *Record Information* puts a side panel tab on the record page. [E26] Its screen
   applies to saved incidents and interactions. [E27]
2. The data broker *SOW Record Information* calls `SOWIncidentInfo.getRecordInfo()` when the
   user can read the incident. [E28]
3. `getSLAConfig` names two timer configurations; `getSlaInfo` counts the task SLAs for **View
   all SLAs**. [E29]
4. Each configuration maps the four priority SLAs of its kind, in priority order; completed SLAs
   and actual time are shown, cancelled ones aren't. [E30] [E31] `SLATimerSNC` prefers a running,
   then a paused, then a breached task SLA. [E32]

The OLAs and the underpinning contract are in no mapping, so they only show in the Task SLAs
list. [E30] [E31] `sn_slm_timer`'s own *Incident Response and Resolution Team* maps all eight
priority SLAs and isn't used by the panel. [E33]

## 4. Who can see and change task SLAs {label=NEW}

| Operation | Roles | Record |
|---|---|---|
| read | `sla_admin`, `itil`, `sla_manager`, `sn_esm_agent` | [E34] |
| read (incident SLAs only) | `sn_incident_read` | [E35] |
| write | `sla_admin` | [E36] |
| Repair SLAs | `sla_admin`, on the 2011 engine | [E25] [E23] |

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.sla.engine.version` | 2011 | the engine in use [E19] |
| `com.snc.sla.run_old_sla_engine` | false | the 2010 engine is off [E20] |
| `com.snc.sla.engine.async` | false | task SLAs update with the incident [E21] |
| `com.snc.sla.workflow.run_for_breached` | true | flows run for SLAs attached breached [E22] |
| `com.snc.sla.repair.enabled` | true | Repair SLAs available [E23] |

## Open questions {label=OPEN-QUESTION}

1. The flows' *If* steps (for example "only if there is an assignee") aren't in the mirror;
   who gets the warnings on an unassigned incident? [E10] [E11]
2. Is the 50% warning to the CI's *Supported by* wanted, given that no breach email follows it?
   [E11] [E16]
3. Should the OLAs and the underpinning contract show in the workspace timers? They are in no
   timer mapping. [E30] [E31]
4. The two ATF definitions are active on incident, but start only on incidents whose short
   description begins "ATF SLA Incident". [E07] [E08] Can they stay, or should they be inactive
   outside test runs?
5. The SLA definition that runs the communication task flow isn't in the mirror. [E12]
