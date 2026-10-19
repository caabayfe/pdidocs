---
title: When on-call work reaches you
reviewed: 2026-10-19
evidence:
  E01:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Trigger Rules list (trigger_rule)
    how: opened On-Call Scheduling › Trigger Rules
    result: No records to display
  E02:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: On-Call Escalations list (on_call_escalation), the Escalation Log
    how: opened On-Call Scheduling › Escalation Log
    result: No records to display
  E03:
    seen:
      by: Documentation agent, as admin
      on: 2026-10-19
      where: Shifts list (cmn_rota), all records
    how: opened the list of shifts
    result: No records to display
  E04:
    record: sys_script_include/57891886732220102eb52d2b04f6a729
    field: script
    how: read TriggerRuleSNC.process
    result: 'acts only when the record has an assignment group and its assignee is empty or not a member of that group; starts the rule''s subflow in the background, after cancelling on-call subflows already running on the record; the flows write to the work notes unless the table is configured otherwise'
    hash: d3982599543732dc6a0f87383b5db40003beedb0502c3e3b223c31155a77e45e
  E05:
    record: sys_hub_flow/ab8fd52083935210ca9b7eabb22bc047
    children: sys_hub_sub_flow_instance_v2
    how: 'read On-Call: Assign'
    result: 'runs On-Call: Assign and Notify SNC with notify_to_assignee false'
    hash: 64669af3d4936f334806f3e08ebfd6d5fa7ad0413f942d48e1fff5fd48051c9d
  E06:
    record: sys_hub_flow/ffbc116c83535210ca9b7eabb22bc01a
    children: sys_hub_sub_flow_instance_v2
    how: 'read On-Call: Assign and Notify'
    result: 'runs On-Call: Assign and Notify SNC with notify_to_assignee true'
    hash: 60c9597ecc9ce88f4c73e4595f19e957771bae18c4aa38aacdd511e7061e1ac9
  E07:
    record: sys_hub_flow/35ef9d2083935210ca9b7eabb22bc09c
    children: sys_hub_action_instance_v2
    how: 'read On-Call: Assign and Notify SNC'
    result: 'if a shift covers the time and someone is on call, and the record has no assignee: finds the current on-call member, assigns the record to them, sends an SMS to each SMS number in their preferences when notifying, writes a journal entry, and logs the escalation as auto assigned'
    hash: 6a914fd1487436025f345e1bf3733a8aa87bdb1b74942d6d43a62e4f37f337f6
  E08:
    record: sys_hub_flow/60fa2e547f8ed6108a8976977c866584
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Assign By Acknowledgement'
    result: 'runs one escalation per shift in parallel; when the record is assigned or closed, ends with "Escalation plan has been cancelled as {0} has been assigned" or "... has been closed"'
    hash: 23458748896e0e3c8201c327d75fe16f71c57ca44ea8ef25ab6c3129b84a390b
  E09:
    record: sys_hub_flow/c36d7b09779b1210eb9b1aceca5a9927
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Assign By Acknowledgement Per Rota'
    result: 'for each escalation level: contacts the next people through On-Call: Send Notifications, waits, sends reminders if the level has them, moves on to the next level, and runs the catch-all when no level is left'
    hash: e05a1259d9b296d310b390bda4c28bb588f907a13e2b5aaab0c51ea76d9c925a
  E10:
    record: sys_hub_flow/eee44d7d7f2312103cbe73ed6c86653b
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Escalations by Email'
    result: 'the same escalation by email only; ends when the record has an assignee, or is inactive'
    hash: 755447254ec86a1e0421ada6d455722ee36261f49f3faf8e89cf367333d15c9c
  E11:
    record: sys_hub_flow/a00d9b127f4112106e8c7769ac8665df
    children: sys_hub_flow_logic_instance_v2
    how: 'read On-Call: Conference Call Escalation SNC'
    result: 'for an active conference call: calls the escalatees of each level in parallel, and goes to the next level when all of them reject'
    hash: b09671555fd4cd63f0ce831dd2fe7881521299c99fa96efd5bf90e14cc5ebf2f
  E12:
    record: on_call_communication_channel_config/ab59e6e0438a121033871e0e85b8f22a
    how: read the email channel configuration
    result: 'active; title "{number} On-Call Assignment"; "{number} was escalated."; reply with ACC in the message body to assign yourself, REJ to move it to the next person'
    hash: f9ca6b2f4004272884ce4d3dbfc019b6bf20815b34a019197a6148c10dbff47d
  E13:
    record: on_call_communication_channel_config/1a726d2e438ad21033871e0e85b8f298
    how: read the SMS channel configuration
    result: 'active; "{number} was escalated."; reply with the message number followed by ACC to accept or REJ to reject'
    hash: 4aa36756e6fe1d2b684d880fa1a03653a655f70cd8d8d8de5acdaaff00ad1fe7
  E14:
    record: on_call_communication_channel_config/c0f9ac1e4342d21033871e0e85b8f24b
    how: read the voice channel configuration
    result: 'active; "Press 1 to assign yourself", "Press 2 to reject"'
    hash: ccbccdf7c4ecdd8de477824ef2bd160c37620bf534e64040917c7943ad2dde31
  E15:
    record: sysevent_in_email_action/ae4aa8700fd502003dde8fbce1050e45
    field: script
    how: 'read the inbound email action On-Call: Assign by Acknowledgement'
    result: 'active, type reply, table incident; reads ACC or REJ from the reply and passes it to OnCallAssignByAck'
    hash: 4c4b283b2b9f80da12c987871b4e1df5f3eb4f55fe8f9905cb0f4e6f7845ef7c
  E16:
    record: sys_script_include/08886bed538720100999ddeeff7b129d
    field: script
    how: read OnCallAssignByAckSNC
    result: 'an answer counts only if the record has no assignee yet and, to accept, the person can read the record; accept sets the assignee and, when no workflow continues, adds the work note "{0} acknowledged"; reject records the rejection and resumes the escalation with the next person'
    hash: 9911ce60fabffba765429d1d0b2b9ea402089a600705f44bbfb3d1706dedb8d9
  E17:
    record: sys_script/0277b416c7d11010c24ae122c7c26048
    field: script
    how: read Resume On-Call workflows (task, after update, when Assigned to changes to a value)
    result: wakes the waiting on-call subflows of the record, which then end because it is assigned
    hash: d911b7941ba976e3ccc1d9e88cf3328b61f4cf3f7a92c061bfaea5f27d134c24
  E18:
    record: sys_db_object/a1e196cf83778310292aca75eeaad366
    children: sys_choice
    how: read the cmn_rota catch-all choices
    result: Notify Individual, Notify All, Notify Group Manager
    hash: 8ea60df6debbc85832664a9b4321e14a35cd1ee21c766aae7fdf5bc45fae52ce
  E19:
    record: on_call_communication_channel_config/ab59e6e0438a121033871e0e85b8f22a
    how: read the catch-all texts of the email channel
    result: '"Task {number} needs urgent attention"; "Task {number} was escalated but no on-call user accepted it in time. Please investigate."'
    hash: f9ca6b2f4004272884ce4d3dbfc019b6bf20815b34a019197a6148c10dbff47d
  E20:
    record: sys_app_module/027c64cdc77200102e65e122c7c2604e
    how: read the Escalation Log module
    result: 'list of on_call_escalation, view EscalationsLog, roles itil and rota_admin'
    hash: f463d5d28eb4e199b23cee14b7432b1060df77b82f11bb484b7e4634ccbc22dc
  E21:
    record: sys_security_acl/a0e66b14c74a40100c54885827c260d1
    field: script
    how: read the read ACL of on_call_escalation
    result: 'sn_on_call_admin, or anyone who can read the escalated record, or a member of the escalation''s group who can read the calendars'
    hash: b92fe631e6a02a243b099a2b88af4cd6ad440fc459e2e0dd04c862014a1bb745
  E22:
    record: sys_db_object/6ce156cf83778310292aca75eeaad347
    children: sys_choice
    how: read the on_call_escalation choices
    result: 'status Live, Completed, Cancelled; category Auto Assignment, Assign By Acknowledgement, Notify And Manual Assignment, Conferencing Hunt'
    hash: 029014784a80e83b2816b92bdd5c97fbc48b889dc77fd96ec3e22aba5b312c89
  E23:
    record: sys_ui_macro/284d7ef553081010bf68ddeeff7b1243
    field: xml
    how: read on_call_escalation_tracking
    result: 'a "Track On-Call Escalation" button beside the field, shown when the record has on-call escalations and highlighted while one is active'
    hash: 1fba441eeb5e7015ded676995b8d92be4bfee8b96d3b1b5d1c8dc4c4859715db
  E24:
    record: sys_dictionary_override/9bf97551c3a32200b6dcdfdc64d3ae64
    how: read the incident override of Assignment group
    result: 'attributes ref_contributions=on_call_escalation_tracking'
    hash: e9681f8fccbf58d6af93b15f8e5e81c8178f0a62ca5a4120b898d07af722fd92
  E25:
    record: sys_db_object/c6d112cf83778310292aca75eeaad353
    children: sys_choice
    how: read the on_call_escalation_comm choices
    result: 'channels Email, SMS, Voice, Task, Conference escalation; responses Accepted, Rejected, Auto Assigned, Invalid Response; status Sent, Failed'
    hash: 0765f861e1cfab657049d32cd5e8f73255f2970f507eba2f558c455fde2a6f70
  E26:
    record: sys_properties/110b43c9c70b00100c54885827c2605f
    field: value
    how: read com.snc.on_call_rotation.log_escalations
    result: 'false'
    hash: fcbcf165908dd18a9e49f7ff27810176db8e9f63b4352213741664245224f8aa
  E27:
    record: sys_script_include/e3e4ae19c70200102e65e122c7c26057
    field: script
    how: read OnCallEscalationUtilSNC
    result: 'logEscalationStart, logEscalationLevel, logEscalationAttempt, logEscalationCommunication, logEscalationEnd and setCommunicationResponse write nothing when com.snc.on_call_rotation.log_escalations is not true'
    hash: 0da3e3ffbf7b530e99fb5302805102d0d0e3153badd4a515b5700f2152d51ac2
---
## On pdi2 today {label=NEW}

**Nothing runs today.** The on-call flows start only from a trigger rule, and pdi2 has none [E01];
they act only for groups with a shift, and pdi2 has none of those either [E03]. The Escalation Log
is empty [E02], and would stay empty even then: escalation logging is switched off. [E26] [E27]
An incident assigned to a group is handled as usual: the group's members pick it up.

What follows is what members and agents will see once a shift and a trigger rule exist. Setting
them up is described in [Set up and maintain a shift](see:set-up-shift) and [Set the escalation
and trigger rules](see:escalation).

## What happens when work reaches your group {label=NEW}

1. An incident (or another task) is assigned to a group with a shift, and nobody in that group is
   assigned. [E04]
2. The group's trigger rule starts one of the on-call flows, in the background. Any on-call flow
   already running on the record is cancelled first. [E04]
3. The flow does one of these, as the rule says:

   | Flow | What happens to you |
   |---|---|
   | **On-Call: Assign** | the person on call now is made the assignee, without a message [E05] [E07] |
   | **On-Call: Assign and Notify** | the same, and that person gets an SMS [E06] [E07] |
   | **On-Call: Assign By Acknowledgement** | people are contacted in turn, by email, SMS or a call, until one accepts [E08] [E09] |
   | **On-Call: Escalations by Email** | the same, by email only [E10] |
   | **On-Call: Conference Call Escalation** | the people of each level are called together into a conference call [E11] |

4. Steps are written to the record's **work notes**. [E04] [E07] They are also kept in the
   **Escalation Log**, but only while escalation logging is on, and on pdi2 it is off. [E22] [E26]
   [E27]

## Accept or reject {label=NEW}

{{animation:ocrespond}}

When the flow asks you to take the work, the message tells you how to answer [E12] [E13] [E14]:

| You got | To accept | To reject |
|---|---|---|
| An email, *"INC… On-Call Assignment"* | reply with **ACC** in the message body | reply with **REJ** |
| An SMS | reply with the message number followed by **ACC** | the number followed by **REJ** |
| A call | press **1** | press **2** |

- **Accept**: you become the assignee, and the work notes say *… acknowledged*. The escalation
  stops. [E16]
- **Reject**: the next person in the escalation is contacted. [E16]
- **No answer**: after the wait, you may get a reminder; then the next level is contacted. [E09]

Your answer counts only while the record has no assignee, and you can accept only a record you
can open. [E16] If someone assigns the record by hand, the escalation ends. [E08] [E17]

Email replies work for **incidents** only: that is the one table the reply rule handles. [E15]

## When nobody accepts {label=NEW}

The shift's **catch-all** is told last: one named person, everyone on the roster, or the group's
manager. [E09] [E18] By email the subject is *"Task … needs urgent attention"*. [E19] The catch-all
can still accept.

## Follow an escalation {label=NEW}

On pdi2 escalation logging is off, so nothing below shows any escalation until it is switched on.
[E26] [E27] Follow the record's work notes instead.

- On the classic incident form, a **Track On-Call Escalation** button appears beside **Assignment
  group** when the incident has escalations; it is highlighted while one is running. [E23] [E24]
- **On-Call Scheduling › Escalation Log** lists every escalation, for `itil` and `rota_admin`.
  [E20] You see an escalation if you can open its record, or if you are in its group. [E21]

| Status | Means |
|---|---|
| **Live** | people are being contacted |
| **Completed** | someone accepted or was assigned, or the steps ran out |
| **Cancelled** | stopped, for example by a new on-call flow on the same record |

[E22] Each contact shows its channel and the answer: *Accepted*, *Rejected*, *Auto Assigned* or
*Invalid Response*. [E25]

## Tips

- Answer with the exact keyword: anything else is logged as an invalid response. [E25]
- Accept from the device that was contacted; replies from an address that isn't on your profile
  may not be matched to you. [E15] [E16]
- If you take an incident by hand, the other people stop being contacted. [E17]

## Not yet seen {label=OPEN-QUESTION}

1. Escalation logging is off on pdi2 (it is on by default): is that intended? Without it, the
   Escalation Log and the *Track On-Call Escalation* button stay empty. [E26] [E27]
2. No escalation has run on pdi2, so none of the messages, the work notes or the Escalation Log
   has been seen with data. [E02]
3. Is a telephony provider set up for SMS and calls? Without one, only email can reach people.
4. Which flow should each group's trigger rule use? [E01]
5. Should email replies work for other tables than incident, such as problem or change? [E15]
6. What does the SMS of *On-Call: Assign and Notify* say? Its text in the mirror reads like a
   placeholder (see the configuration page). [E07]
