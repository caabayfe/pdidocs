---
title: Meet an incident's deadlines
reviewed: 2026-10-19
evidence:
  E01:
    record: contract_sla/2ca94b74c3143200b6dcdfdc64d3ae93
    how: read Priority 1 response (15 minutes)
    result: starts when an active priority 1 incident has an assignment group; stops when it has left New and has an assignee; never pauses; runs the Default SLA flow
    hash: 432d40f389fdbc967319820583344ed835a7d679dfdf051283a5642e5940c691
  E02:
    record: contract_sla/35420982d732220035ae23c7ce610393
    how: read Priority 1 resolution (1 hour)
    result: starts when an active incident has priority 1; pauses while On Hold - Awaiting Caller and while Resolved; stops at Closed; runs the SLA notification and escalation flow
    hash: 6157ef1df804d16a5907062d37e4c485a8acec29cf19eaeb923f59159f793aa9
  E03:
    record: contract_sla/752bcf74c3143200b6dcdfdc64d3aeeb
    how: read Priority 2 response (1 hour), its retroactive and cancel settings
    result: 'retroactive, start set to the incident''s created time, past pauses counted; cancelled when its start condition no longer matches; the same on all eight priority SLAs'
    hash: 933e26eadf78b9aaa6a9718a5a23074e1153ed3c6d5700f0baf7a75bbbad59ef
  E04:
    record: sys_script/6fab2e470a0007045931f2a692878933
    how: read Incident State Active on Assignment
    result: a New incident that gets an assignee is set to In Progress
    hash: 56d370b105abf6182b075b4936fd79acbee1bd08cfaaef3435ce7f1cd8cb0d05
  E05:
    record: contract_sla/ba320982d732220035ae23c7ce610347
    how: read Network group resolution (OLA)
    result: starts when the incident is assigned to one network group; stops when it leaves that group or closes; same pauses as the priority SLAs
    hash: 6849c0eec1ffe5b482cf495acc8d91437f2cda28ec7b8ab78dbc770b0f0f59bc
  E06:
    record: contract_sla/3b524982d732220035ae23c7ce6103e4
    how: read SAN 001 contract resolution (underpinning contract)
    result: starts when the incident's configuration item is one storage CI; stops when the CI changes or the incident closes
    hash: 2bdb2fd131cf6b8b6f5cc3ba0352a27192fac949838c7114c1e2a01eddb161b6
  E07:
    record: sys_ux_app_route/e934b8dc43032110361dff53e9b8f21c
    how: read the side panel route Record Information (sn_sow)
    result: a side panel tab Record Information, icon heartbeat-outline, order 100
    hash: c6f0385f3cc330ae2d3c1b2abbebc968d26c9910868f9ae0932f52f659312608
  E08:
    record: sys_ux_screen/afd4b8dc43032110361dff53e9b8f28a
    field: screen_condition
    how: read the screen Record Information SNC
    result: shown for a saved incident (and for interactions)
    hash: 0c3c66420e5598b4eab7a84eac5afaf3c6bad2c2355e29299febaa2d81bd1253
  E09:
    record: sys_ux_macroponent/fb23080b530230108e4dddeeff7b12ca
    field: required_translations
    how: read the labels of the Record Information panel
    result: 'Record Information, SLAs and timings, Opened for, Recent incidents, Recent interactions, VIP, Major incident duration'
    hash: 12ac11a1cebfce48575982089707c215d48cef64a04308e721941ac17fd7d831
  E10:
    record: sys_ux_client_script_include/55616816437431107f08ff53e9b8f24d
    field: script
    how: read SOWRecordInformationUtilsSNC.getSlaConfig
    result: 'two timers: Response SLA ("Time to respond") and Resolution SLA ("Time to resolve")'
    hash: fdd999981f4efc6cc11d769128877079e60e65a228eea9461d82390aebd947e2
  E11:
    record: sys_script_include/9dd95cb7530230108e4dddeeff7b1223
    field: script
    how: read SOWIncidentInfoSNC.getSlaInfo
    result: 'counts the incident''s task SLAs and offers "View all SLAs", which lists them as "Task SLAs"'
    hash: eff1ae5f786d0bfc07f05c001bff3c2b85fa1199af2e053cddbeadd4f5c1a544
  E12:
    record: sla_timer_config/af871ab3532730102d05ddeeff7b124f
    how: read the SLA timer configuration Incident Response and its mappings
    result: 'Task to SLA mapping: the priority 1 to 4 response SLAs; shows completed SLAs and the actual time'
    hash: f906816631b6093d48832d3dcfeada3c164ed683f6296b990cb4f695f4754c0c
  E13:
    record: sla_timer_config/aca7d6b3532730102d05ddeeff7b12ec
    how: read the SLA timer configuration Incident Resolution and its mappings
    result: 'Task to SLA mapping: the priority 1 to 4 resolution SLAs; shows completed SLAs and the actual time'
    hash: 9c3332816dc5f29014cebf959cb071f8b659710d57b69469eaa88a9750793d35
  E14:
    record: sys_ux_lib_component/77ab141cb242ea9e4719eacaf792db0d
    field: required_translation_keys
    how: read the labels of the SLA timer component (now-sla-timer)
    result: 'No matching SLA, Breached, Out of Schedule, "Breached on {0}", "{0} remaining", "{0}% time elapsed", "{0} until {1}"'
    hash: aabc9a0f1560b1846a1e5c359b65d9f680a1ef783ed1aa81070e0005e3eb0fdb
  E15:
    record: sys_ui_related_list/fa3f3ac143e9d2108c5fa32d68b8f24b
    how: read the incident's related lists in the Service Operations Workspace view
    result: task_sla first, then task_ci and task_cmdb_ci_service
    hash: 73b1913c826b56fe758873726968b365bd03b5c7b29643ed2b24831c520ea8ba
  E16:
    record: sys_hub_flow/828f267973333300e289235f04f6a7a3
    children: sys_hub_action_instance
    how: read the steps of the Default SLA flow
    result: 'at 50% and at 75%, sla.warning.parm to the assignee; at breach, sla.warning.breach.parm to the assignee and to the assignee''s manager'
    hash: 7c762de74e156b3df407dbcd9fb4b8afd6f83e897c7eb6a80f93e18911bf569f
  E17:
    record: sys_hub_flow/0335e63573333300e289235f04f6a70f
    children: sys_hub_action_instance
    how: read the steps of the SLA notification and escalation flow
    result: 'at 50%, warning to the assignee and to the CI''s Supported by; at 75%, warning to the assignee and the assignee''s manager; at breach, breach email to the assignee and the manager'
    hash: 62ba93abaeb23e27747ba4da6f567ddec8f9bd260ddd998a962ff8c0884bf5b8
  E18:
    record: sysevent_email_action/9660628ed7a2220035ae23c7ce61039e
    how: read SLA warning Parm
    result: 'on task_sla; subject "SLA "…" associated with INC… has reached …%"; to the user named in the event'
    hash: 5e293724f3d4e57b015ee109024c97e35030dd9957e0ec493a0fd44ada86c5e8
  E19:
    record: sysevent_email_action/93a0ee4ed7a2220035ae23c7ce610368
    how: read SLA breached Parm
    result: 'on task_sla; subject "SLA "…" associated with INC… has breached"'
    hash: 20fd6bbbffa0fd489711f6961beec9b56c821368498903bc1b59408da201e985
  E20:
    record: sys_script_email/37afdfa7cb601300dff9b9c0c24c9ca4
    field: script
    how: read sla.warn_message.event_parm1
    result: 'the assignee reads "… has reached N% of its allowed duration"; anyone else also reads who it is assigned to'
    hash: c6e7e9074440ac98c25b21de94712ea3e5dddaf29273df165a4f6d7f6d08fec4
  E21:
    record: sysevent_email_action/8d324981d7d6220035ae23c7ce6103b5
    how: read SLA warning CI Supported By
    result: 'tells the CI''s Supported by person that a CI they support has an open incident at N% of its allowed duration'
    hash: c54ea34a96bdb5935ea62006a53c425af14d1ef6c01e3c304e46fb7fc020f665
  E22:
    record: sys_properties/98929cf8eb3201003623666cd206fe62
    field: value
    how: read com.snc.sla.workflow.run_for_breached
    result: "true: the flow runs even for an SLA that is already breached when it is attached"
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E23:
    record: sys_ui_action/effeb6810b032200ff6707a7b6673a47
    how: read Show SLA Timeline on task
    result: a form link on the classic form, shown when the record has a task SLA
    hash: 31c859e59cdf23a9aeea9b18be06a603717242ccba1115236a1f84977a11b64a
---
Every incident carries deadlines, called **SLAs**: one for the first response and one for the fix.
The priority decides how long each one is (see [Priority and deadlines](see:priority-and-deadlines)).
This page is about what you do with them while you work.

## The two clocks {label=NEW}

| Clock | Starts | Pauses | Stops |
|---|---|---|---|
| **Response** | the incident has a priority and an assignment group [E01] | never [E01] | it has left *New* and has an assignee [E01] |
| **Resolution** | the incident has a priority [E02] | *On Hold - Awaiting Caller*, and *Resolved* [E02] | *Closed* [E02] |

Assigning a person to a *New* incident puts it *In Progress* at once [E04], so **Assign to me**
meets the response SLA in one click.

The resolution clock completes only at *Closed*, but it is paused from the moment you resolve.
So in practice it is met if you **resolve** in time and the caller doesn't reopen.
Waiting for a change, a problem or a vendor does **not** pause it. [E02]

## When the priority changes {label=NEW}

The priority SLAs count from when the incident was **created**, not from when the priority was
set. When you raise the priority, the old SLAs are cancelled and the new ones start, counted from
the creation time, with past pauses taken off. [E03] Raising a two-hour-old incident to
*1 - Critical* therefore gives it a 15-minute response SLA that is already breached. That is
intended: the clock reflects how long the caller has waited.

## Group and supplier deadlines {label=NEW}

Two support groups have their own resolution deadline (an **OLA**) while an incident is
assigned to them, and one storage device has a supplier deadline (an **underpinning contract**).
They run beside the priority SLAs and stop when the incident leaves the group or the device.
[E05] [E06] You see them in the **Task SLAs** list, not in the timers below.

## Where you see them {label=NEW}

{{animation:incsla}}

1. On a saved incident, open **Record Information** (the heartbeat icon) in the side panel.
   [E07] [E08]
2. Under **SLAs and timings** there are two timers: **Response SLA** (*Time to respond*) and
   **Resolution SLA** (*Time to resolve*). [E09] [E10] Each shows the priority SLA that applies,
   including one already met. [E12] [E13]
3. A timer reads *"… remaining"* or *"…% time elapsed"*, *Breached*, *Out of Schedule* outside
   its working hours, or *No matching SLA* when none applies yet. [E14]
4. **View all SLAs** lists every SLA on the incident, OLAs included, as **Task SLAs**. [E11]

The same list is the first one under **Related records › Task SLAs**. [E15] On the classic form,
**Show SLA Timeline** draws the SLA's history. [E23]

## The warning emails {label=NEW}

The SLA engine emails as each deadline approaches:

| When | Response SLA | Resolution SLA, OLA, contract |
|---|---|---|
| 50% of the time used | the assignee [E16] | the assignee, and the person who supports the incident's CI [E17] [E21] |
| 75% | the assignee [E16] | the assignee and their manager [E17] |
| breached | the assignee and their manager [E16] | the assignee and their manager [E17] |

The subject says *"SLA … associated with INC… has reached 75%"* or *"… has breached"*.
[E18] [E19] Your manager's copy also says who the incident is assigned to. [E20] An SLA that is
already breached when it starts, after a priority change, sends its breach email straight away.
[E22]

## Tips

- Assign a person as soon as you take an incident: the response SLA wants an assignee, not just a group.
- Ask the caller with *On Hold - Awaiting Caller*, not *In Progress* and a comment: only the
  first pauses the clock.
- Resolve when the fix is in; don't wait for the caller's confirmation.
- A breach email is no reason to rush the fix wrongly; tell the caller what is happening instead.

## Not yet seen {label=OPEN-QUESTION}

Nobody has walked the SLA screens yet; this page is read from the mirror.

1. Does **Record Information** open with *SLAs and timings* for an incident, and what does a
   timer look like on time, paused and breached?
2. Which SLA does a timer show when a response SLA was cancelled by a priority change?
3. Who receives the warnings when the incident has no assignee? The flows' conditions aren't in
   the mirror. [E16] [E17]
4. Do agents rely on the emails, or on the timers? If the timers, the 50% warnings may only be
   noise.
