---
title: When on-call work reaches you - configuration
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Trigger Rules list (trigger_rule)
    how: opened the list of trigger rules
    result: No records to display
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Escalations list (on_call_escalation)
    how: opened the Escalation Log
    result: No records to display
  E03:
    record: sys_properties/f8d4808b53c21210adc6ddeeff7b1279
    field: value
    how: read com.snc.on_call_rotation.new_trigger_engine
    result: 'true; applies only when the trigger rule''s action is Subflow'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E04:
    record: sys_properties/5bcd60b29380221067c612f984891815
    field: value
    how: read glide.oncall.only_flow_enabled_release
    result: 'true'
    hash: b5bea41b6c623f7c09f1bf24dcae58ebab3c0cdd90ad966bc43a45b44867e12b
  E05:
    record: sys_hub_flow/1700f38353c21210adc6ddeeff7b12f9
    children: sys_hub_action_instance_v2
    how: 'read On-Call: New Trigger Engine Handler'
    result: 'one step, On-Call: Run Trigger Rule Subflow, with the event, the trigger rule and the record'
    hash: f9a83e8ee87c32538868d3f8c7876663f75db9e89ebc1c44f733dfe2fc36ab98
  E06:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC
    result: 'group and user fields from the table''s trigger_rule_table_cfg, else assignment_group and assigned_to; journal field from the same, else work_notes; returns when the assignee is a member of the group; runs a script, workflow or subflow; a subflow runs in the background in the record''s domain with source_table, source_sys_id, trigger_group_field, trigger_group_sys_id, trigger_user_field and journal_field; earlier on-call subflows on the record are cancelled and their escalations marked cancelled'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E07:
    record: sys_hub_flow/ab8fd52083935210ca9b7eabb22bc047
    children: sys_hub_sub_flow_instance_v2
    how: 'read On-Call: Assign'
    result: 'calls On-Call: Assign and Notify SNC, notify_to_assignee false'
    hash: 64669af3d4936f334806f3e08ebfd6d5fa7ad0413f942d48e1fff5fd48051c9d
  E08:
    record: sys_hub_flow/ffbc116c83535210ca9b7eabb22bc01a
    children: sys_hub_sub_flow_instance_v2
    how: 'read On-Call: Assign and Notify'
    result: 'calls On-Call: Assign and Notify SNC, notify_to_assignee true'
    hash: 60c9597ecc9ce88f4c73e4595f19e957771bae18c4aa38aacdd511e7061e1ac9
  E09:
    record: sys_hub_flow/35ef9d2083935210ca9b7eabb22bc09c
    children: sys_hub_action_instance_v2
    how: 'read On-Call: Assign and Notify SNC (run as system)'
    result: 'Get Escalation Details; Log Escalation Start (category auto_assignment); Look Up Record; Get current on-call member; Assign record to on-call member; Log Escalation Level and Attempt; when notifying, Get user sms preferences and a Send SMS step for each number, Add Journal, Log Escalation Communication; Set Escalatee Response; Log Escalation End'
    hash: 6a914fd1487436025f345e1bf3733a8aa87bdb1b74942d6d43a62e4f37f337f6
  E10:
    record: sys_hub_flow/35ef9d2083935210ca9b7eabb22bc09c
    children: sys_hub_action_instance_v2
    how: read the message input of the Send SMS step (order 27)
    result: '"Hola, inc has been assigned 2 u."'
    hash: 6a914fd1487436025f345e1bf3733a8aa87bdb1b74942d6d43a62e4f37f337f6
  E11:
    record: sys_hub_flow/60fa2e547f8ed6108a8976977c866584
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Assign By Acknowledgement'
    result: 'Get Escalation Details; journal "anybody on call" message; Log Escalation Start; Get Communication Channel Configuration Records; for each shift in parallel, On-Call: Assign By Acknowledgement Per Rota; then a journal entry "Escalation plan has been cancelled as {0} has been assigned" or "… closed"; Clear SMS message numbers; Log Escalation End'
    hash: 23458748896e0e3c8201c327d75fe16f71c57ca44ea8ef25ab6c3129b84a390b
  E12:
    record: sys_hub_flow/c36d7b09779b1210eb9b1aceca5a9927
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Assign By Acknowledgement Per Rota'
    result: 'loops over levels and contacts: Get Current Contact Details, Manage Escalation Response (Add), On-Call: Send Notifications, Wait For Message "Resume per rota" with a timeout; reminders when required; Update Escalation Level; at the end, On-Call: Assign By Ack Per Rota Catch-All'
    hash: e05a1259d9b296d310b390bda4c28bb588f907a13e2b5aaab0c51ea76d9c925a
  E13:
    record: sys_hub_flow/776bbb5153131210418e59f230e5e691
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Assign By Ack Per Rota Catch-All'
    result: 'by catch-all type (individual, all, group manager) contacts each catch-all contact through On-Call: Send Notifications, then waits the catch-all wait time'
    hash: e8d635082261d5df73da7765b940196cc7226d78ac63b6a98d50a679ab8836ff
  E14:
    record: sys_hub_flow/cceeda2c53f3121002d1ddeeff7b1282
    how: 'read On-Call: Send Notifications'
    result: 'sends one contact; the subflows On-Call: Send Notification - Email, - SMS and - Voice do the sending'
    hash: c32f3bd97e31e4c80989f8034e1897e4f4029b7187503bce89ed0be5b17571f4
  E15:
    record: sys_hub_flow/eee44d7d7f2312103cbe73ed6c86653b
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Escalations by Email'
    result: 'for each shift, On-Call: Escalations By Email Per Rota; ends with a journal entry when the record is assigned or inactive'
    hash: 755447254ec86a1e0421ada6d455722ee36261f49f3faf8e89cf367333d15c9c
  E16:
    record: sys_hub_flow/29750dbd7f2312103cbe73ed6c8665f9
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Escalations By Email Per Rota'
    result: 'channel Email; escalates levels, and a level made of groups calls Escalations by Email for each group; notifications through On-Call: Escalations By Email Per Rota - Notifications (d0b81604ff6722103387ffffffffff2a); waits for "Resume per rota"; catch-all last'
    hash: fd6968327eb27eabc6f1788a761a6dcf5f4811dcfa60000d423256c0420947d0
  E17:
    record: sys_hub_flow/10f370ed7f6512106e8c7769ac866514
    children: sys_hub_sub_flow_instance_v2
    how: 'read On-Call: Conference Call Escalation Main'
    result: 'calls On-Call: Conference Call Escalation SNC, then cleans the escalation responses'
    hash: 73cca78e27051e160307c78ab146519635e013531572fb1302da3d700321674e
  E18:
    record: sys_hub_flow/a00d9b127f4112106e8c7769ac8665df
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Conference Call Escalation SNC'
    result: 'ends unless the Notify conference call is active; per level and shift, On-Call: Conference Call Escalation Parallel SNC (b78f3b3c7f9552106e8c7769ac866526) calls the escalatees; the next level only when all rejected'
    hash: b09671555fd4cd63f0ce831dd2fe7881521299c99fa96efd5bf90e14cc5ebf2f
  E19:
    record: sys_script/bda1d8280f1010101d6d6bfaa8767e4a
    field: script
    how: read Resume On-Call Conference Workflow (notify_participant, after insert and update, active changes to true)
    result: 'runs global.resume_conference_call_escalation for the conference call when a participant joins'
    hash: d84156f26842669b5643ba226b66648f0e8163437273c9f3a4a397329294f123
  E20:
    record: on_call_communication_channel_config/ab59e6e0438a121033871e0e85b8f22a
    how: read the email channel configuration
    result: 'active, default, order 100, subflow On-Call: Send Notification - Email; keywords ACC and REJ; titles "{number} On-Call Assignment" and, for the catch-all, "Task {number} needs urgent attention"'
    hash: f9ca6b2f4004272884ce4d3dbfc019b6bf20815b34a019197a6148c10dbff47d
  E21:
    record: on_call_communication_channel_config/1a726d2e438ad21033871e0e85b8f298
    how: read the SMS channel configuration
    result: 'active, default, order 100, subflow On-Call: Send Notification - SMS; reply {message_number}ACC or {message_number}REJ to {on_call_group_notify_number}'
    hash: 4aa36756e6fe1d2b684d880fa1a03653a655f70cd8d8d8de5acdaaff00ad1fe7
  E22:
    record: on_call_communication_channel_config/c0f9ac1e4342d21033871e0e85b8f24b
    how: read the voice channel configuration
    result: 'active, default, order 100, subflow On-Call: Send Notification - Voice; keys 1 and 2'
    hash: ccbccdf7c4ecdd8de477824ef2bd160c37620bf534e64040917c7943ad2dde31
  E23:
    record: sysevent_in_email_action/ae4aa8700fd502003dde8fbce1050e45
    field: script
    how: 'read On-Call: Assign by Acknowledgement (inbound, reply, incident, order 101)'
    result: 'finds the user from the sender or a matching notification device; for a subflow escalation, parses the reply with the email channel''s keywords, else with ACC and REJ; calls OnCallAssignByAck and the provider''s processResponse'
    hash: 4c4b283b2b9f80da12c987871b4e1df5f3eb4f55fe8f9905cb0f4e6f7845ef7c
  E24:
    record: sys_script_include/08886bed538720100999ddeeff7b129d
    field: script
    how: read OnCallAssignByAckSNC
    result: 'checks the user, valid group and user fields, an empty assignee and, to accept, read access; accept: records Accepted, sets the user field as system with setUseEngines(false), resumes the workflow or writes "{0} acknowledged" to work notes; reject: records Rejected and sends "Resume per rota" (and "Resume catch all") to the waiting subflows'
    hash: 9911ce60fabffba765429d1d0b2b9ea402089a600705f44bbfb3d1706dedb8d9
  E25:
    record: sys_script/0277b416c7d11010c24ae122c7c26048
    field: script
    how: read Resume On-Call workflows (task, after update, assigned_to changes and is not empty)
    result: 'for each on_call_escalation_response of the record, resumes its workflow or sends "Resume per rota" to its subflow'
    hash: d911b7941ba976e3ccc1d9e88cf3328b61f4cf3f7a92c061bfaea5f27d134c24
  E26:
    record: sys_properties/110b43c9c70b00100c54885827c2605f
    field: value
    how: read com.snc.on_call_rotation.log_escalations
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E27:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC.isEscalationLogEnabled
    result: 'the property defaults to true; when it isn''t true, logEscalationStart, Level, Attempt, Communication, End and setCommunicationResponse return without writing'
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
  E28:
    record: sys_app_module/027c64cdc77200102e65e122c7c2604e
    how: read Escalation Log
    result: 'on_call_escalation list, view EscalationsLog, roles itil and rota_admin'
    hash: f463d5d28eb4e199b23cee14b7432b1060df77b82f11bb484b7e4634ccbc22dc
  E29:
    record: sys_security_acl/a0e66b14c74a40100c54885827c260d1
    field: script
    how: read the on_call_escalation read ACL
    result: 'gs.hasRole("sn_on_call_admin"), or the source record can be read, or the user is in the escalation''s group and OCCalendarUtils.canRead()'
    hash: b92fe631e6a02a243b099a2b88af4cd6ad440fc459e2e0dd04c862014a1bb745
  E30:
    record: sys_ui_macro/284d7ef553081010bf68ddeeff7b1243
    field: xml
    how: read on_call_escalation_tracking
    result: '"Track On-Call Escalation" reference decoration, shown when on_call_escalation records exist for the record, highlighted while one is active'
    hash: 1fba441eeb5e7015ded676995b8d92be4bfee8b96d3b1b5d1c8dc4c4859715db
  E31:
    record: sys_dictionary_override/9bf97551c3a32200b6dcdfdc64d3ae64
    how: read incident.assignment_group
    result: 'ref_contributions=on_call_escalation_tracking'
    hash: e9681f8fccbf58d6af93b15f8e5e81c8178f0a62ca5a4120b898d07af722fd92
  E32:
    record: sys_properties/eb3407f80b9b1300d93f478d83673a48
    field: value
    how: read com.snc.on_call_rotation.escalation_rule_rota_overlap
    result: 'all: escalate to all shifts when shifts overlap'
    hash: 5ef5ef0364b6939c4ca61f34b393f7b368d1be8619647aaf83d5b395919ab629
  E33:
    record: sys_properties/a0f693a877801010cfb82191a9106104
    how: read com.snc.on_call_rotation.catch_all_wait_time
    result: seconds to wait for an answer at the catch-all level; the value is redacted in the mirror
    hash: 13140030c5522b7ce8ee249850b46d7c94a5714a49d9f40ff62150aa3894118c
  E34:
    record: sys_properties/5e74f2c6eb9f70106de683402a522878
    field: value
    how: read com.snc.on_call_rotation.notification.voice.use_notify_call
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E35:
    record: sys_properties/b1c4e820433431103424dc5f6ab8f24b
    field: value
    how: read com.snc.on_call_escalation_notification_delegate_user
    result: 'false; would send escalation notifications to the delegate'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
---
## The applications {label=NEW}

All of it is in On-Call Scheduling (global): the trigger engine, the on-call subflows and their
actions, the channel configurations, the reply rule and the escalation log. Trigger rules and the
escalation policy that feed these flows are on
[Set the escalation and trigger rules - configuration](see:escalation).

**On pdi2 nothing runs:** there are no trigger rules [E01], no shifts, the Escalation Log is
empty [E02], and escalation logging is off. [E26] [E27]

## 1. The trigger {label=NEW}

1. A trigger rule fires on the record. With the new trigger engine on, a subflow rule is run
   through *On-Call: New Trigger Engine Handler*. [E03] [E05] Only subflows are supported on this
   release. [E04]
2. `TriggerRuleSNC` takes the group and user fields from the table's trigger rule configuration,
   or `assignment_group` and `assigned_to`, and the journal field, or `work_notes`. [E06]
3. It stops if the assignee is already a member of the group. Otherwise it cancels on-call
   subflows already running on the record and starts the rule's subflow in the background. [E06]

## 2. The flows {label=NEW}

| Subflow | Category | Steps |
|---|---|---|
| On-Call: Assign | Auto Assignment | Assign and Notify SNC without notifying [E07] [E09] |
| On-Call: Assign and Notify | Auto Assignment | Assign and Notify SNC, SMS to the assignee [E08] [E09] |
| On-Call: Assign By Acknowledgement | Assign By Acknowledgement | one Per Rota subflow per shift, in parallel [E11] [E12], catch-all [E13] |
| On-Call: Escalations by Email | email only | Per Rota by email [E15] [E16] |
| On-Call: Conference Call Escalation Main | Conferencing Hunt | conference escalation through Notify [E17] [E18] [E19] |

Every contact goes through *On-Call: Send Notifications*, which picks the email, SMS or voice
subflow. [E14] Shifts that overlap are all escalated. [E32]

**The SMS text.** In *On-Call: Assign and Notify SNC* the Send SMS step's message reads
*"Hola, inc has been assigned 2 u."* [E10] It is sent as is to the assignee's SMS numbers whenever
that flow runs. Replace it with a proper message, in a copy of the flow, before using *Assign and
Notify*.

## 3. Channels and answers {label=NEW}

| Channel | Accept | Reject | Sent by |
|---|---|---|---|
| Email [E20] | `ACC` in the reply | `REJ` | *On-Call: Send Notification - Email* |
| SMS [E21] | `{message number}ACC` | `{message number}REJ` | *On-Call: Send Notification - SMS* |
| Voice [E22] | 1 | 2 | *On-Call: Send Notification - Voice* |

1. Email replies are read by the inbound action *On-Call: Assign by Acknowledgement*, for
   **incident** only. [E23]
2. `OnCallAssignByAckSNC` checks the answer. Accept sets the assignee as system without running
   business rules, and writes *"… acknowledged"* to the work notes. Reject sends *Resume per
   rota* to the waiting subflow so that it moves on. [E24]
3. Assigning the task by hand makes *Resume On-Call workflows* wake the waiting subflows, which
   then end. [E25] Accepting doesn't run business rules, so it resumes them itself. [E24]

## 4. The escalation log {label=NEW}

1. The flows call the log actions at each start, level, attempt, contact and end. [E09] [E11]
2. `OnCallEscalationUtilSNC` writes them only when `com.snc.on_call_rotation.log_escalations` is
   true, which is the default. **On pdi2 it is false**, so nothing would be logged. [E26] [E27]
3. The **Escalation Log** module shows `on_call_escalation` to `itil` and `rota_admin` [E28]; the
   read ACL lets in `sn_on_call_admin`, readers of the record and members of the group. [E29]
4. On the incident form, `Assignment group` carries the *Track On-Call Escalation* decoration,
   which appears only when escalation records exist. [E30] [E31]

## Properties {label=NEW}

| Property | pdi2 | Effect |
|---|---|---|
| `com.snc.on_call_rotation.new_trigger_engine` | true | subflow rules run through the new engine [E03] |
| `glide.oncall.only_flow_enabled_release` | true | only subflows [E04] |
| `com.snc.on_call_rotation.log_escalations` | false | **no escalation log** [E26] [E27] |
| `com.snc.on_call_rotation.escalation_rule_rota_overlap` | all | overlapping shifts all escalate [E32] |
| `com.snc.on_call_rotation.catch_all_wait_time` | redacted | wait at the catch-all level [E33] |
| `com.snc.on_call_rotation.notification.voice.use_notify_call` | false | voice escalations don't use a Notify call [E34] |
| `com.snc.on_call_escalation_notification_delegate_user` | false | no delegation of escalation messages [E35] |

## Open questions {label=OPEN-QUESTION}

1. Escalation logging was switched off on pdi2. Was that intended? Do the flows still work as
   expected without escalation records, and should it be on before any trigger rule is created?
   [E26] [E27]
2. The SMS text of *Assign and Notify* is a placeholder. [E10] Is it replaced at run time, or must
   the flow be copied and corrected?
3. Is a telephony provider (Notify with a driver) set up for SMS, calls and conference calls?
   [E18] [E21] [E22]
4. Should the reply rule cover problem, change and other tasks, not only incident? [E23]
5. Accepting sets the assignee without running business rules [E24]: are assignment
   notifications and SLAs expected to react to it?
